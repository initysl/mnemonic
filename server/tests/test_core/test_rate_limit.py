"""Rate limiting: client identification and bucket lifecycle."""
from datetime import datetime, timedelta
from unittest.mock import MagicMock

import pytest

from app.core.rate_limit import RateLimiter


def request_with(xff=None, host="10.0.0.1"):
    request = MagicMock()
    request.headers = {"x-forwarded-for": xff} if xff else {}
    request.client = MagicMock()
    request.client.host = host
    return request


class TestClientIdentification:
    """
    Keying on request.client.host puts everyone behind a reverse proxy into
    one shared bucket, where a single caller locks out every other user.
    """

    def test_callers_behind_one_proxy_get_separate_buckets(self):
        limiter = RateLimiter(60, trusted_proxy_hops=1)

        first = limiter.client_id(request_with(xff="203.0.113.7"))
        second = limiter.client_id(request_with(xff="198.51.100.9"))

        assert first != second

    def test_the_trusted_hop_identifies_the_client(self):
        limiter = RateLimiter(60, trusted_proxy_hops=1)

        assert limiter.client_id(request_with(xff="203.0.113.7")) == "ip:203.0.113.7"

    def test_forged_entries_cannot_choose_the_bucket(self):
        """
        A client can put anything at the left of X-Forwarded-For; the proxy
        appends the address it actually saw at the right.
        """
        limiter = RateLimiter(60, trusted_proxy_hops=1)

        identity = limiter.client_id(
            request_with(xff="1.2.3.4, 5.6.7.8, 203.0.113.7")
        )

        assert identity == "ip:203.0.113.7"

    def test_two_trusted_hops_look_one_further_left(self):
        limiter = RateLimiter(60, trusted_proxy_hops=2)

        identity = limiter.client_id(request_with(xff="1.2.3.4, 203.0.113.7, 10.0.0.9"))

        assert identity == "ip:203.0.113.7"

    def test_header_is_ignored_when_no_proxy_is_trusted(self):
        limiter = RateLimiter(60, trusted_proxy_hops=0)

        identity = limiter.client_id(request_with(xff="203.0.113.7", host="10.0.0.1"))

        assert identity == "ip:10.0.0.1"

    def test_falls_back_to_the_peer_address(self):
        limiter = RateLimiter(60, trusted_proxy_hops=1)

        assert limiter.client_id(request_with(host="192.0.2.5")) == "ip:192.0.2.5"

    def test_unknown_client_is_handled(self):
        limiter = RateLimiter(60, trusted_proxy_hops=1)
        request = request_with()
        request.client = None

        assert limiter.client_id(request) == "unknown"

    @pytest.mark.parametrize("xff", ["", "   ", ","])
    def test_empty_headers_fall_back(self, xff):
        limiter = RateLimiter(60, trusted_proxy_hops=1)

        assert limiter.client_id(request_with(xff=xff, host="192.0.2.5")) == "ip:192.0.2.5"


class TestLimiting:
    def test_requests_within_the_limit_pass(self):
        limiter = RateLimiter(3)

        assert [limiter.check_rate_limit("a") for _ in range(3)] == [True] * 3

    def test_the_next_request_is_blocked(self):
        limiter = RateLimiter(3)
        for _ in range(3):
            limiter.check_rate_limit("a")

        assert limiter.check_rate_limit("a") is False

    def test_one_client_does_not_affect_another(self):
        limiter = RateLimiter(3)
        for _ in range(4):
            limiter.check_rate_limit("a")

        assert limiter.check_rate_limit("b") is True

    def test_old_requests_fall_out_of_the_window(self):
        limiter = RateLimiter(2)
        limiter.check_rate_limit("a")
        limiter.check_rate_limit("a")
        assert limiter.check_rate_limit("a") is False

        limiter.requests["a"] = [datetime.now() - timedelta(seconds=90)] * 2

        assert limiter.check_rate_limit("a") is True


class TestBucketLifecycle:
    def test_idle_buckets_are_evicted(self):
        """The bucket dict used to retain a key for every client ever seen."""
        limiter = RateLimiter(60)
        limiter.check_rate_limit("old")
        limiter.requests["old"] = [datetime.now() - timedelta(minutes=5)]

        limiter.check_rate_limit("new")

        assert "old" not in limiter.requests

    def test_active_buckets_are_kept(self):
        limiter = RateLimiter(60)
        limiter.check_rate_limit("active")

        limiter.check_rate_limit("other")

        assert "active" in limiter.requests

    def test_bucket_count_does_not_grow_without_bound(self):
        limiter = RateLimiter(60)

        for index in range(100):
            limiter.check_rate_limit(f"client-{index}")
            limiter.requests[f"client-{index}"] = [
                datetime.now() - timedelta(minutes=5)
            ]

        limiter.check_rate_limit("current")

        assert len(limiter.requests) == 1
