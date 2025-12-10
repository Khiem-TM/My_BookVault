package com.khiem.identity.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.khiem.event.dto.NotificationEvent;
import com.khiem.identity.entity.EmailVerificationToken;
import com.khiem.identity.entity.PasswordResetToken;
import com.khiem.identity.entity.User;
import com.khiem.identity.exception.AppException;
import com.khiem.identity.exception.ErrorCode;
import com.khiem.identity.repository.EmailVerificationTokenRepository;
import com.khiem.identity.repository.PasswordResetTokenRepository;
import com.khiem.identity.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailVerificationService {
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.email-verification-expiry-hours:24}")
    private int emailVerificationExpiryHours;

    @Value("${app.password-reset-expiry-hours:24}")
    private int passwordResetExpiryHours;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public EmailVerificationService(
            EmailVerificationTokenRepository emailVerificationTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            UserRepository userRepository,
            KafkaTemplate<String, Object> kafkaTemplate) {
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userRepository = userRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendEmailVerification(User user) {
        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plusSeconds(emailVerificationExpiryHours * 3600L);

        // Invalidate previous tokens
        emailVerificationTokenRepository.findByUserIdAndUsedFalse(user.getId()).ifPresent(oldToken -> {
            oldToken.setUsed(true);
            emailVerificationTokenRepository.save(oldToken);
        });

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .used(false)
                .build();

        emailVerificationTokenRepository.save(verificationToken);

        String verificationLink = frontendUrl + "/verify-email?token=" + token;

        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("EMAIL")
                .recipient(user.getEmail())
                .subject("Email Verification - MyBook")
                .body("Please click the link below to verify your email:\n" + verificationLink
                        + "\n\nThis link will expire in " + emailVerificationExpiryHours + " hours.\n\n"
                        + "If you didn't create this account, please ignore this email.")
                .build();

        kafkaTemplate.send("notification-delivery", notificationEvent);
        log.info("Email verification sent to: {}", user.getEmail());
    }

    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

        if (verificationToken.isUsed()) {
            throw new AppException(ErrorCode.TOKEN_ALREADY_USED);
        }

        if (Instant.now().isAfter(verificationToken.getExpiryDate())) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        emailVerificationTokenRepository.save(verificationToken);

        log.info("Email verified for user: {}", user.getUsername());
    }

    public void sendPasswordResetEmail(User user) {
        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plusSeconds(passwordResetExpiryHours * 3600L);

        // Invalidate previous tokens
        passwordResetTokenRepository.findByUserIdAndUsedFalse(user.getId()).ifPresent(oldToken -> {
            oldToken.setUsed(true);
            passwordResetTokenRepository.save(oldToken);
        });

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .used(false)
                .build();

        passwordResetTokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + token;

        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("EMAIL")
                .recipient(user.getEmail())
                .subject("Password Reset Request - MyBook")
                .body(
                        "We received a request to reset your password. Click the link below to reset it:\n" + resetLink
                                + "\n\nThis link will expire in " + passwordResetExpiryHours + " hours.\n\n"
                                + "If you didn't request this, please ignore this email and your password will remain unchanged.")
                .build();

        kafkaTemplate.send("notification-delivery", notificationEvent);
        log.info("Password reset email sent to: {}", user.getEmail());
    }

    public boolean isValidResetToken(String token) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

        if (resetToken.isUsed()) {
            throw new AppException(ErrorCode.TOKEN_ALREADY_USED);
        }

        if (Instant.now().isAfter(resetToken.getExpiryDate())) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        return true;
    }

    public void markResetTokenAsUsed(String token) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    public PasswordResetToken getResetToken(String token) {
        return passwordResetTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
    }
}
