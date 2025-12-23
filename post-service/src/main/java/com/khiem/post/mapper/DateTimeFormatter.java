package com.khiem.post.mapper;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.FormatStyle;
import java.util.Locale;

@Component
public class DateTimeFormatter {
    java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM)
            .withLocale(Locale.UK)
            .withZone(ZoneId.systemDefault());

    public String format(Instant instant){
        return formatter.format(instant);
    }
}
