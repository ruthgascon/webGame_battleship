package salvo.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

@RestController
//Add a RequestMapping to the class to add /api to all URLs for this controller.
@RequestMapping("/api")

public class SalvoController {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GamePlayerRepository gamePlayerRepository;

    @Autowired
    private PlayerRepository playerRepository;

    ///////////////LARGEST OBJECT///////////////
    @RequestMapping("/games")
    public Map<String, Object> loggedIn() {
        Authentication authentication = logCheck();
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("Player", getUser(authentication));
        dto.put("Games", getAllGames());
        return dto;
    }

    @RequestMapping(path = "/games", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> creatingGame(Authentication authentication) {
        if (authentication == null){
            return new ResponseEntity<Map<String, Object>>(errorMap("FORBIDDEN", "Log in, please"), HttpStatus.UNAUTHORIZED);
        } else {
            Player player = playerRepository.findByUserName(authentication.getName());
            String name = player.getUserName();
            // create game
            Game game = new Game();
            gameRepository.save(game);
            //create new game player
            GamePlayer gp = new GamePlayer(player, game);
            gamePlayerRepository.save(gp);
            return new ResponseEntity<Map<String, Object>>(loggedIn(), HttpStatus.CREATED);
        }
    }

    private Authentication logCheck() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof AnonymousAuthenticationToken)) {
            return authentication;
        } else {
            return null;
        }
    }

    private List<Object> getAllGames() {
        return gameRepository
                .findAll()
                .stream()
                .map(game -> makeGameDTO(game))
                .collect(Collectors.toList());
    }

    private Map<String, Object> getUser(Authentication authentication) {
        if (authentication == null) {
            return null;
        } else {
            Player player = playerRepository.findByUserName(authentication.getName());
            return makePlayerLoggedIn(player);
        }
    }

    private Map<String, Object> makePlayerLoggedIn(Player player) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("Player ID", player.getId());
        dto.put("Mail", player.getUserName());
        return dto;
    }

    private Map<String, Object> makeGameDTO(Game game) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("Game ID", game.getId());
        dto.put("Created Data", game.getCreatedDate());
        // CREATE A LIST of maps WITH GAME PLAYERS
        List<Object> gameplayersDTO = game.getGamePlayers()
                .stream()
                .map(gamePlayer -> makeGamePlayerDTO(gamePlayer))
                .collect(Collectors.toList());
        dto.put("Game Players", gameplayersDTO);
        return dto;
    }

    private Map<String, Object> makeGamePlayerDTO(GamePlayer gamePlayer) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("Game Player ID", gamePlayer.getId());
        dto.put("Player", makePlayersDTO(gamePlayer.getPlayer()));
        Score score = gamePlayer.getScore();
        dto.put("Score", score == null ? "No scores" : score.getFinalScore());
        return dto;
    }

    private Map<String, Object> makePlayersDTO(Player player) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("Player ID", player.getId());
        dto.put("Email", player.getUserName());
        return dto;
    }

    @RequestMapping(path="/games/{id}/players", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> joinGame (Authentication authentication, @PathVariable Long id){
        Player player = playerRepository.findByUserName(authentication.getName());
        if (player == null){
            return new ResponseEntity<>(errorMap("FORBIDDEN", "Log in, please"), HttpStatus.FORBIDDEN);
        } else {
            Game game = gameRepository.findOne(id);
            if (game == null){
                return new ResponseEntity<>(errorMap("NO SUCH GAME", "Join another"), HttpStatus.FORBIDDEN);
            } else {
                Set<GamePlayer> gamePlayers = game.getGamePlayers();
               if (gamePlayers.size() ==2 ){
                    return new ResponseEntity<>(errorMap("GAME'S FULL", "Join another"), HttpStatus.FORBIDDEN);
                } else {
                    if (gamePlayers.stream().filter(g-> g.getPlayer().getId() == player.getId()).findFirst().orElse(null) != null){
                        return new ResponseEntity<>(errorMap("YOU ARE IN THE GAME", "Join another"), HttpStatus.FORBIDDEN);
                    } else {
                        GamePlayer gp = new GamePlayer(player, game);
                        gamePlayerRepository.save(gp);
                        return new ResponseEntity<>(gamePlayerID(gp), HttpStatus.CREATED);
                    }

                }
            }

        }
    }

    private Map<String, Object> gamePlayerID (GamePlayer gp) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("GamePlayerID", gp.getId() );
        return dto;
    }



    @RequestMapping(path = "/players", method = RequestMethod.POST)
    public ResponseEntity<String> createUser(String username, String password) {
        Player player = playerRepository.findByUserName(username);
        if (player != null) {
            return new ResponseEntity<>("Error", HttpStatus.FORBIDDEN);
        } else {
            playerRepository.save(new Player(username, password));
            return new ResponseEntity<>("created", HttpStatus.CREATED);
        }
    }

    @RequestMapping(path = "/game_view/{gamePlayerID}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable Long gamePlayerID, Authentication authentication) {
        //2nd OPTION: GET PLAYER NAME by pathVariable - check if authentication name is the same
        boolean match = false;
        if (authentication == null) {
            return new ResponseEntity<Map<String, Object>>(errorMap("FORBIDDEN", "Log in, please"), HttpStatus.FORBIDDEN);
        } else {
            Player player = playerRepository.findByUserName(authentication.getName());
            Set<GamePlayer> gameplayers = player.getGamePlayers();
            if (gameplayers.size() > 0) {

                for (GamePlayer gameplayer : gameplayers) {
                    long id = gameplayer.getId();
                    if (id == gamePlayerID) {
                        match = true;
                    }
                }
                if (match){
                    return new ResponseEntity<Map<String, Object>>(findGamePlayer(gamePlayerID, authentication), HttpStatus.OK);
                } else {
                    return new ResponseEntity<Map<String, Object>>(errorMap("NO MATCH", "It's not your game player"), HttpStatus.UNAUTHORIZED);
                }

            }
            return new ResponseEntity<Map<String, Object>>(errorMap("NO GAME PLAYER", "Join a game"), HttpStatus.UNAUTHORIZED);
        }
    }

    private Map <String, Object> errorMap (String what, String reason){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put(what, reason);
        return dto;
    }

    private Map<String,Object> findGamePlayer(Long gamePlayerID, Authentication authentication) {
        GamePlayer gamePlayer = gamePlayerRepository.findOne(gamePlayerID);
        Game game = gamePlayer.getGame();
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put ("GAME ID", game.getId());
        dto.put ("Created", game.getCreatedDate());
        List<Object> makeGamePlayerDTO2 = game.getGamePlayers()
                .stream()
                .map(GamePlayer -> makeGamePlayerDTO(GamePlayer))
                .collect(Collectors.toList());
        dto.put("Game Players", makeGamePlayerDTO2);
        List<Object> makeShipsDTO2 = gamePlayer.getShips()
                .stream()
                .map(ship -> makeShipDTO(ship))
                .collect(Collectors.toList());
        dto.put("Ships", makeShipsDTO2);
        List<Object> makeSalvoesDTO2 = game.getGamePlayers()
                .stream()
                .map(GamePlayer -> makeSalvoGamePlayerDTO(GamePlayer))
                .collect(Collectors.toList());
        dto.put("Salvoes", makeSalvoesDTO2);
        return dto;
    }



    private Map<String, Object> makeShipDTO(Ship ship) {
        Map<String,Object> dto = new LinkedHashMap<>();
        dto.put("Type", ship.getType());
        dto.put("Locations", ship.getLocations());
        return dto;
    }

    private Map<String,Object> makeSalvoGamePlayerDTO(GamePlayer gamePlayer){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("GamePlayer", gamePlayer.getId());
        List<Object> Salvosdto = gamePlayer.getSalvos()
                .stream()
                .map(Salvo -> makeSalvoesDTO(Salvo))
                .collect(Collectors.toList());
        dto.put ("Salvoes", Salvosdto);
        return dto;
    }

    private Map <String, Object> makeSalvoesDTO (Salvo salvo){
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("Turn", salvo.getTurnNumber());
        dto.put("Locations", salvo.getLocations());
        return dto;
    }

    @GetMapping("/leaderboard")
    public List<Object> getAllPlayers() {
        return playerRepository
                .findAll()
                .stream()
                .map(player -> makePlayerScoresDTO(player))
                .collect(Collectors.toList());
    }

    private Map <String, Object> makePlayerScoresDTO(Player player){
        Map<String,Object> dto = new LinkedHashMap<>();
        dto.put ("Player", player.getUserName());
        Set<Score> scoreList = player.getScores();
        dto.put ("All Scores", makeFinalScoresDTO(scoreList));
        dto.put ("Total", makeSum(scoreList));
        dto.put ("Wins", makeCounter(scoreList, 1.00));
        dto.put ("Lose", makeCounter(scoreList, 0.00));
        dto.put ("Tie", makeCounter(scoreList, 0.50));
        return dto;
    }

    //it is not necessary
    private Map<String, List> makeFinalScoresDTO (Set<Score> scoreList) {
        Map<String, List> scoresList = new LinkedHashMap<>();
        List<Double> allScores = new ArrayList<>();
        for (Score score : scoreList) {
            allScores.add(score.getFinalScore());
        }
        scoresList.put("All Scores", allScores);
        return scoresList;
    }

    private Double makeSum (Set<Score> scoreList){
        Double total = 0.00;
        for (Score score : scoreList) {
            total += score.getFinalScore();
        }
        return total;
    }

    private Integer makeCounter (Set<Score> scoreList, Double number){
        Integer total = 0;
        for (Score score : scoreList) {
            if (score.getFinalScore().equals(number)) {
                total++;
            }
        }
        return total;
    }


}