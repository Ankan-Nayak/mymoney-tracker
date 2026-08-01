package com.mymoney.dto;

public class AuthResponse {
    private String jwt;
    private String username;
    private String email;
    private String currency;
    private Boolean darkTheme;
    private String profilePicture;

    public AuthResponse() {}

    public AuthResponse(String jwt, String username, String email, String currency, Boolean darkTheme, String profilePicture) {
        this.jwt = jwt;
        this.username = username;
        this.email = email;
        this.currency = currency;
        this.darkTheme = darkTheme;
        this.profilePicture = profilePicture;
    }

    public String getJwt() { return jwt; }
    public void setJwt(String jwt) { this.jwt = jwt; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Boolean getDarkTheme() { return darkTheme; }
    public void setDarkTheme(Boolean darkTheme) { this.darkTheme = darkTheme; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String jwt;
        private String username;
        private String email;
        private String currency;
        private Boolean darkTheme;
        private String profilePicture;

        public Builder jwt(String jwt) { this.jwt = jwt; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder currency(String currency) { this.currency = currency; return this; }
        public Builder darkTheme(Boolean darkTheme) { this.darkTheme = darkTheme; return this; }
        public Builder profilePicture(String profilePicture) { this.profilePicture = profilePicture; return this; }

        public AuthResponse build() {
            return new AuthResponse(jwt, username, email, currency, darkTheme, profilePicture);
        }
    }
}
