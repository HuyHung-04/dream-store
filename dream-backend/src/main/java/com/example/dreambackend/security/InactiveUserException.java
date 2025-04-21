package com.example.dreambackend.security;

import org.springframework.security.core.AuthenticationException;

public class InactiveUserException extends AuthenticationException {
    public InactiveUserException(String msg, Throwable cause) {
        super(msg, cause);
    }

    public InactiveUserException(String msg) {
        super(msg);
    }
}
