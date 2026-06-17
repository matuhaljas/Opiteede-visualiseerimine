package ee.opiteed.tlu_opiteed.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) {
            chain.doFilter(request, response);
            return;
        }

        String email = jwtUtil.extractEmail(token);
        if (email == null || SecurityContextHolder.getContext().getAuthentication() != null) {
            chain.doFilter(request, response);
            return;
        }

        // Autendi otse tokeni väidetest (stateless) — ei tee andmebaasipäringut.
        // Nii toimib autentimine ka peale backendi restarti, kui kasutajatabel on
        // tühi (nt H2 in-memory). firebaseUid ja role tulevad samadest väidetest,
        // mis token genereerimisel sisse pandi.
        String firebaseUid = jwtUtil.extractFirebaseUid(token);
        String role = jwtUtil.extractRole(token);
        if (role == null) {
            role = "USER";
        }

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                email, firebaseUid,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
        chain.doFilter(request, response);
    }
}
