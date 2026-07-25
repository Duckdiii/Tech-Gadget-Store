package com.project.tech_gadget_store.modules.auth.security;

import com.project.tech_gadget_store.modules.auth.entity.Account;
import com.project.tech_gadget_store.modules.auth.entity.User;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;



public class AccountUserDetails implements UserDetails {

    private final String email;
    private final String password;
    private final String fullName;
    private final String role;
    private final boolean active;
    private final String userId;

    public AccountUserDetails(Account account) {
        this.email = account.getEmail();
        this.password = account.getPassword();
        this.active = account.isActive();

        User user = account.getUser();
        this.fullName = user.getFullName();
        // Virtual call: dispatches to the concrete subclass's override even through a lazy
        // Hibernate proxy of this abstract type, no instanceof/unproxy needed.
        this.role = user.getRoleName();
        this.userId = user.getId();
    }

    public String getFullName() { return fullName; }
    public String getRole()     { return role; }
    public String getUserId()   { return userId; }

    @Override public String getUsername()               { return email; }
    @Override public String getPassword()               { return password; }
    @Override public boolean isAccountNonExpired()      { return true; }
    @Override public boolean isAccountNonLocked()       { return active; }
    @Override public boolean isCredentialsNonExpired()  { return true; }
    @Override public boolean isEnabled()                { return active; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }
}
