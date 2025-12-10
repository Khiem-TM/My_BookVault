package com.khiem.profile.configuration;

import java.text.ParseException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import com.nimbusds.jwt.SignedJWT;

@Component
public class CustomJwtDecoder implements JwtDecoder {
    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);

            Map<String, Object> claims =
                    new HashMap<>(signedJWT.getJWTClaimsSet().getClaims());

            // Extract scope and add as authorities-compatible claim
            Object scope = claims.get("scope");
            if (scope instanceof String) {
                claims.put("authorities", ((String) scope).split(" "));
            }

            return new Jwt(
                    token,
                    signedJWT.getJWTClaimsSet().getIssueTime().toInstant(),
                    signedJWT.getJWTClaimsSet().getExpirationTime().toInstant(),
                    signedJWT.getHeader().toJSONObject(),
                    claims);

        } catch (ParseException e) {
            throw new JwtException("Invalid token");
        }
    }
}
