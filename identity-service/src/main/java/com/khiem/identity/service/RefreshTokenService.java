package com.khiem.identity.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.khiem.identity.entity.RefreshToken;
import com.khiem.identity.entity.User;
import com.khiem.identity.exception.AppException;
import com.khiem.identity.exception.ErrorCode;
import com.khiem.identity.repository.RefreshTokenRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RefreshTokenService {
    RefreshTokenRepository refreshTokenRepository;

    @Value("${app.refresh-token-expiry-days:7}")
    int refreshTokenExpiryDays;

    public RefreshToken generateRefreshToken(User user) {
        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plusSeconds(refreshTokenExpiryDays * 86400L);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken =
                refreshTokenRepository.findByToken(token).orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

        if (refreshToken.isRevoked()) {
            throw new AppException(ErrorCode.TOKEN_REVOKED);
        }

        if (Instant.now().isAfter(refreshToken.getExpiryDate())) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        return refreshToken;
    }

    public void revokeRefreshToken(String token) {
        RefreshToken refreshToken =
                refreshTokenRepository.findByToken(token).orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        log.info("Refresh token revoked for user: {}", refreshToken.getUser().getUsername());
    }

    public void revokeAllUserTokens(String userId) {
        refreshTokenRepository.deleteByUserIdAndRevokedTrue(userId);
        log.info("All revoked tokens deleted for user: {}", userId);
    }
}
