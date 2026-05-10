package com.talenttalk.authservice.service;

import com.talenttalk.authservice.entity.Role;
import com.talenttalk.authservice.entity.User;
import com.talenttalk.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OAuth2UserService
        extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {

        OAuth2User oAuth2User = super.loadUser(request);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String providerId = oAuth2User.getAttribute("sub");

        Optional<User> existingUser =
                userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setImageUrl(picture);
            user.setProvider("google");
            userRepository.save(user);
        } else {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setImageUrl(picture);
            newUser.setProvider("google");
            newUser.setProviderId(providerId);
            newUser.setRole(Role.STUDENT);
            newUser.setVerified(true);
            newUser.setPassword(null);
            userRepository.save(newUser);
        }

        return oAuth2User;
    }
}
