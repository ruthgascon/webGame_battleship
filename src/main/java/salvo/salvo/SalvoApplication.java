package salvo.salvo;

import org.hibernate.boot.jaxb.SourceType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configurers.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@SpringBootApplication
public class SalvoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class, args);
	}

	@Bean
    public CommandLineRunner initData(PlayerRepository playerRepository, GameRepository gameRepository, GamePlayerRepository gamePlayerRepository, ShipRepository shipRepository, SalvoRepository salvoRepository, ScoreRepository scoreRepository) {
        return (args) -> {
            // save players
            Player playerJBauer = new Player("j.bauer@ctu.gov", "bauer");
            playerRepository.save(playerJBauer);
            Player playerCObrian = new Player("c.obrian@ctu.gov", "obrian");
            playerRepository.save(playerCObrian);
            Player playerKBauer = new Player("kim_bauer@gmail.com", "bauer");
            playerRepository.save(playerKBauer);
            Player playerTAlmeida = new Player("t.almeida@ctu.gov", "almeida");
            playerRepository.save(playerTAlmeida);

            // save games
            Game game1 = new Game();
            gameRepository.save(game1);

            // save games with different dates
            Date date = new Date();
            Date newDate1 = Date.from(date.toInstant().plusSeconds(3600));
            Game game2 = new Game();
            game2.setCreatedDate(newDate1);
            gameRepository.save(game2);

            // save games with different dates
            Date newDate2 = Date.from(date.toInstant().plusSeconds(7200));
            Game game3 = new Game();
            game3.setCreatedDate(newDate2);
            gameRepository.save(game3);

            Game game6 = new Game();
            gameRepository.save(game6);

            GamePlayer gp1 = new GamePlayer(playerJBauer, game1);
            gamePlayerRepository.save(gp1);
            GamePlayer gp2 = new GamePlayer(playerCObrian, game1);
            gamePlayerRepository.save(gp2);
            GamePlayer gp3 = new GamePlayer(playerCObrian, game2);
            gamePlayerRepository.save(gp3);
            GamePlayer gp4 = new GamePlayer(playerTAlmeida, game2);
            gamePlayerRepository.save(gp4);
            GamePlayer gp5 = new GamePlayer(playerCObrian, game3);
            gamePlayerRepository.save(gp5);
            GamePlayer gp6 = new GamePlayer(playerJBauer, game3);
            gamePlayerRepository.save(gp6);
            GamePlayer gp11 = new GamePlayer(playerKBauer, game6);
            gamePlayerRepository.save(gp11);

            List<String> ship1Loc = new ArrayList<>();
            ship1Loc.add("H2");
            ship1Loc.add("H3");
            ship1Loc.add("H4");
            Ship ship1 = new Ship("Destroyer", ship1Loc, gp1);
            shipRepository.save(ship1);

            List<String> ship2Loc = new ArrayList<>();
            ship2Loc.add("E1");
            ship2Loc.add("F1");
            ship2Loc.add("G1");
            Ship ship2 = new Ship("Submarine", ship2Loc, gp1);
            shipRepository.save(ship2);

            List<String> ship3Loc = new ArrayList<>();
            ship3Loc.add("B4");
            ship3Loc.add("B5");
            Ship ship3 = new Ship("Patrol Boat", ship3Loc, gp1);
            shipRepository.save(ship3);

            List<String> ship4Loc = new ArrayList<>();
            ship4Loc.add("B5");
            ship4Loc.add("C5");
            ship4Loc.add("D5");
            Ship ship4 = new Ship("Destroyer", ship4Loc, gp2);
            shipRepository.save(ship4);

            List<String> ship5Loc = new ArrayList<>();
            ship5Loc.add("C6");
            ship5Loc.add("C7");
            Ship ship5 = new Ship("Patrol Boat", ship5Loc, gp2);
            shipRepository.save(ship5);

            List<String> ship6Loc = new ArrayList<>();
            ship6Loc.add("A2");
            ship6Loc.add("A3");
            ship6Loc.add("A4");
            Ship ship6 = new Ship("Submarine", ship6Loc, gp2);
            shipRepository.save(ship6);

            List<String> ship7Loc = new ArrayList<>();
            ship7Loc.add("G6");
            ship7Loc.add("H6");
            Ship ship7 = new Ship("Patrol Boat", ship7Loc, gp2);
            shipRepository.save(ship7);

            List<String> ship8Loc = new ArrayList<>();
            ship8Loc.add("B5");
            ship8Loc.add("C5");
            ship8Loc.add("D5");
            Ship ship8 = new Ship("Destroyer", ship8Loc, gp3);
            shipRepository.save(ship8);

            List<String> ship9Loc = new ArrayList<>();
            ship9Loc.add("C6");
            ship9Loc.add("C7");
            Ship ship9 = new Ship("Patrol Boat", ship9Loc, gp3);
            shipRepository.save(ship9);

            List<String> ship10Loc = new ArrayList<>();
            ship10Loc.add("A2");
            ship10Loc.add("A3");
            ship10Loc.add("A4");
            Ship ship10 = new Ship("Submarine", ship10Loc, gp3);
            shipRepository.save(ship10);

            List<String> salvo01Loc = new ArrayList<>();
            salvo01Loc.add("B5");
            salvo01Loc.add("C5");
            salvo01Loc.add("F1");
            Salvo salvo1 = new Salvo(01, salvo01Loc, gp1);
            salvoRepository.save(salvo1);

            List<String> salvo02Loc = new ArrayList<>();
            salvo02Loc.add("F2");
            salvo02Loc.add("D5");
            Salvo salvo2 = new Salvo(02, salvo02Loc, gp1);
            salvoRepository.save(salvo2);

            List<String> salvo03Loc = new ArrayList<>();
            salvo03Loc.add("A1");
            salvo03Loc.add("A4");
            salvo03Loc.add("G6");
            Salvo salvo3 = new Salvo(01, salvo03Loc, gp2);
            salvoRepository.save(salvo3);

            List<String> salvo04Loc = new ArrayList<>();
            salvo04Loc.add("A3");
            salvo04Loc.add("H6");
            Salvo salvo4 = new Salvo(02, salvo04Loc, gp2);
            salvoRepository.save(salvo4);

            Score score1 = new Score(playerJBauer, game1, 1.00 );
            scoreRepository.save(score1);

            Score score2 = new Score(playerCObrian, game1, 0.00 );
            scoreRepository.save(score2);

            Score score3 = new Score(playerJBauer, game2, 0.50 );
            scoreRepository.save(score3);

            Score score4 = new Score(playerCObrian, game2, 0.50 );
            scoreRepository.save(score4);

            };
    }
}

/*Take the mail someone has entered for log in (search in the database).
Return a UserDetails object with name, password, and role information for that user, if any.*/
@Configuration
class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

    @Autowired
    PlayerRepository playerRepository;

    @Override
    public void init(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService());
    }

    @Bean
    UserDetailsService userDetailsService() {
        return new UserDetailsService() {

            @Override
            public UserDetails loadUserByUsername(String mail) throws UsernameNotFoundException {
//              You look up a user by name in your repository, and, if it's found, you create User OBJECT
                Player player = playerRepository.findByUserName(mail);
                if (player != null) {
                    return new User(player.getUserName(), player.getPassword(),
                            AuthorityUtils.createAuthorityList("player"));
                } else {
                    throw new UsernameNotFoundException("Unknown user: " + mail);
                }
            }
        };
    }
}

//    The annotation @Configuration tells Spring to create an instance of this class automatically
@Configuration
@EnableWebSecurity
class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
//        which URL paths should be secured and which should not
        http.authorizeRequests()
                .antMatchers("/web/index.html", "/api/**", "/web/scripts/**","/web/styles/**", "/web/images/**").permitAll()

                .antMatchers("/web/**").hasAuthority("player")
                //it does the same at the line above
                //.antMatchers("/web/**").authenticated()
//                .anyRequest().authenticated()
                .and()

        .formLogin()
                .loginPage("/api/login")
                .usernameParameter("username")
                .passwordParameter("password")
                //we can add permitAll here or in the ANTMATCHERS
                .permitAll()
                .and()

        .logout()
                .logoutUrl("/api/logout");

        // turn off checking for CSRF tokens
        http.csrf().disable();

        // if user is not authenticated, just send an authentication failure response
        http.exceptionHandling().authenticationEntryPoint((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

        // if login is successful, just clear the flags asking for authentication
        http.formLogin().successHandler((req, res, auth) -> clearAuthenticationAttributes(req));

        // if login fails, just send an authentication failure response
        http.formLogin().failureHandler((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

        // if logout is successful, just send a success response
        http.logout().logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler());
    }

    private void clearAuthenticationAttributes(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
        }
    }

}