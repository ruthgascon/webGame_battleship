package salvo.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Comparator;

import java.util.*;
import java.util.stream.Collectors;

@RestController

@RequestMapping("/api")

public class SalvoController {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GamePlayerRepository gamePlayerRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private ShipRepository shipRepository;

    @Autowired
    private SalvoRepository salvoRepository;

    @Autowired
    private ScoreRepository scoreRepository;

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
        if (authentication == null) {
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
                .sorted(Comparator.comparing(GamePlayer::getId))
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

    @RequestMapping(path = "/games/{id}/players", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> joinGame(Authentication authentication, @PathVariable Long id) {
        Player player = playerRepository.findByUserName(authentication.getName());
        if (player == null) {
            return new ResponseEntity<>(errorMap("FORBIDDEN", "Log in, please"), HttpStatus.FORBIDDEN);
        } else {
            Game game = gameRepository.findOne(id);
            if (game == null) {
                return new ResponseEntity<>(errorMap("NO SUCH GAME", "Join another"), HttpStatus.FORBIDDEN);
            } else {
                Set<GamePlayer> gamePlayers = game.getGamePlayers();
                if (gamePlayers.size() == 2) {
                    return new ResponseEntity<>(errorMap("GAME'S FULL", "Join another"), HttpStatus.FORBIDDEN);
                } else {
                    if (gamePlayers.stream().filter(g -> g.getPlayer().getId() == player.getId()).findFirst().orElse(null) != null) {
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

    private Map<String, Object> gamePlayerID(GamePlayer gp) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("GamePlayerID", gp.getId());
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
                if (match) {
                    return new ResponseEntity<Map<String, Object>>(findGamePlayer(gamePlayerID, authentication), HttpStatus.OK);
                } else {
                    return new ResponseEntity<Map<String, Object>>(errorMap("NO MATCH", "It's not your game player"), HttpStatus.UNAUTHORIZED);
                }
            }
            return new ResponseEntity<Map<String, Object>>(errorMap("NO GAME PLAYER", "Join a game"), HttpStatus.UNAUTHORIZED);
        }
    }

    private Map<String, Object> errorMap(String what, String reason) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put(what, reason);
        return dto;
    }

    private Map<String, Object> findGamePlayer(Long gamePlayerID, Authentication authentication) {
        GamePlayer gamePlayer = gamePlayerRepository.findOne(gamePlayerID);
        Game game = gamePlayer.getGame();
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("GAME ID", game.getId());

        dto.put("Created", game.getCreatedDate());
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
        GamePlayer opponent = null;
        for (GamePlayer GP : game.getGamePlayers()){
            if (GP.getId() != gamePlayer.getId()) {
                opponent = GP;
            }
        }
        if (opponent != null){
            dto.put("Hits You Did", checkHits(gamePlayer, opponent));
            dto.put ("Your ships hitted", checkHits(opponent, gamePlayer));
        }
        dto.put ("Ships alive", checkShipsAlive(gamePlayer, game.getGamePlayers()));
        dto.put("Game State", checkGameState(gamePlayer));
        return dto;
    }

    private List <Object> checkHits (GamePlayer currentGP, GamePlayer opponent){
        List <Object> hits = new ArrayList<>();
        Map<String, Integer> counter = new LinkedHashMap<>();
        Set<Ship> opponentShips = opponent.getShips();
            for (Ship opponentShip : opponentShips){
                List<String> opponentShipLocations = opponentShip.getLocations();
                Set<Salvo> currentGPsalvoes = currentGP.getSalvos();
                for (Salvo currentGPsalvo : currentGPsalvoes){
                    List <String> currentGPsalvoLocations = currentGPsalvo.getLocations();
                        for (String location : currentGPsalvoLocations){
                            if (opponentShipLocations.stream().anyMatch(l -> l.equals(location))){
                                if (!counter.containsKey(opponentShip.getType())){
                                    counter.put(opponentShip.getType(), opponentShip.getLocations().size()-1);
                                } else {
                                    counter.put(opponentShip.getType(), counter.get(opponentShip.getType()) -1);
                                }
                                if (counter.get(opponentShip.getType()) == 0){
                                    opponentShip.setSunk(true);
                                }
                                Map<String, Object> dto = new LinkedHashMap<>();
                                dto.put ("TypeOfShip", opponentShip.getType());
                                dto.put ("Sunk", opponentShip.isSunk());
                                dto.put ("Turn", currentGPsalvo.getTurnNumber());
                                dto.put ("Cell", location);
                                hits.add(dto);
                            }
                        }
                    }
                }
        return hits;
    }

    private List <Object> checkShipsAlive (GamePlayer gamePlayer, Set<GamePlayer> gamePlayers){
        List <Object> ships = new ArrayList<>();
        for (GamePlayer GP : gamePlayers){
            if (GP.getId() != gamePlayer.getId()){
                for (Ship ship : GP.getShips()){
                    if (ship.isSunk() == false){
                        Map<String, Object> dto = new LinkedHashMap<>();
                        dto.put("ship", ship.getType());
                        ships.add(dto);
                    }
                }
            }
        }
        return ships;
    }

    private Map<String, Object> makeShipDTO(Ship ship) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("Type", ship.getType());
        dto.put("Locations", ship.getLocations());
        return dto;
    }

    private Map<String, Object> makeSalvoGamePlayerDTO(GamePlayer gamePlayer) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("GamePlayer", gamePlayer.getId());
        List<Object> Salvosdto = gamePlayer.getSalvos()
                .stream()
                .filter(salvo -> salvo.getTurnNumber() != null)
                .sorted(Comparator.comparing(Salvo::getTurnNumber))
                .map(Salvo -> makeSalvoesDTO(Salvo))
                .collect(Collectors.toList());
        dto.put("Salvoes", Salvosdto);
        return dto;
    }

    private Map<String, Object> makeSalvoesDTO(Salvo salvo) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("Turn", salvo.getTurnNumber());
        dto.put("Locations", salvo.getLocations());
        return dto;
    }

    private GameState checkGameState(GamePlayer gamePlayer){
        Game game = gamePlayer.getGame();
        GameState state;
        GamePlayer opponent = null;
            for (GamePlayer GP : game.getGamePlayers()){
                if (GP.getId() != gamePlayer.getId()){
                    opponent = GP;
                }
            }
            if (opponent == null){
                state = GameState.WAITING_OPPONENT;
            } else if (gamePlayer.getShips().size() == 0){
                state = GameState.WAITING_YOUR_SHIPS;
            } else if (opponent.getShips().size() == 0){
                state = GameState.WAITING_OPPONENT_SHIPS;
            }  else if (waitingTurn(gamePlayer,opponent)){
                state = GameState.WAITING_TURN;
            } else {
                if (waitingTurn(gamePlayer,opponent) == false && waitingTurn(opponent,gamePlayer) == false) {
                    if ((checkShipsAlive(opponent, game.getGamePlayers())).size() == 0 && (checkShipsAlive(gamePlayer, game.getGamePlayers())).size() == 0) {
                        state = GameState.TIE;
                        Set <Score> Scores = gamePlayer.getGame().getScores();
                        if (Scores.size() > 0){
                            Score gamePlayerScore = new Score(gamePlayer.getPlayer(), game, 0.50);
                            scoreRepository.save(gamePlayerScore);
                        } else if (Scores.size() == 1) {
                            for (Score s : Scores){
                                if (s.getPlayer().getId() != gamePlayer.getPlayer().getId()){
                                    Score gamePlayerScore = new Score(gamePlayer.getPlayer(), game, 1.00);
                                    scoreRepository.save(gamePlayerScore);
                                }
                            }
                        }
                    } else if ((checkShipsAlive(gamePlayer, game.getGamePlayers())).size() == 0) {
                        state = GameState.YOU_WIN;
                        Set <Score> Scores = gamePlayer.getGame().getScores();
                        if (Scores.size() == 0){
                            Score gamePlayerScore = new Score(gamePlayer.getPlayer(), game, 1.00);
                            scoreRepository.save(gamePlayerScore);
                        } else if (Scores.size() == 1) {
                            for (Score s : Scores){
                                if (s.getPlayer().getId() != gamePlayer.getPlayer().getId()){
                                    Score gamePlayerScore = new Score(gamePlayer.getPlayer(), game, 1.00);
                                    scoreRepository.save(gamePlayerScore);
                                }
                            }

                        }
                    } else if ((checkShipsAlive(opponent, game.getGamePlayers())).size() == 0) {
                        state = GameState.YOU_LOOSE;
                        Set <Score> Scores = gamePlayer.getGame().getScores();
                        if (Scores.size() == 0) {
                            Score gamePlayerScore = new Score(gamePlayer.getPlayer(), game, 0.00);
                            scoreRepository.save(gamePlayerScore);
                        } else if (Scores.size() == 1) {
                            for (Score s : Scores){
                                if (s.getPlayer().getId() != gamePlayer.getPlayer().getId()){
                                    Score gamePlayerScore = new Score(gamePlayer.getPlayer(), game, 0.00);
                                    scoreRepository.save(gamePlayerScore);
                                }
                            }

                        }
                    }else {
                        state = GameState.YOUR_TURN;
                    }
                } else {
                    state = GameState.YOUR_TURN;
                }
            }
        return state;
    }

    private boolean waitingTurn(GamePlayer gamePlayer, GamePlayer opponent) {
        boolean turn;
        Integer yourTurn = gamePlayer.getSalvos().size();
        Integer opponentTurn = opponent.getSalvos().size();
        if (yourTurn <= opponentTurn) {
            turn = false;
        } else {
            turn = true;
        }
        return turn;
    }

    @GetMapping("/leaderboard")
    public List<Object> getAllPlayers() {
        return playerRepository
                .findAll()
                .stream()
                .map(player -> makePlayerScoresDTO(player))
                .collect(Collectors.toList());
    }

    private Map<String, Object> makePlayerScoresDTO(Player player) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("Player", player.getUserName());
        Set<Score> scoreList = player.getScores();
        dto.put("All Scores", makeFinalScoresDTO(scoreList));
        dto.put("Total", makeSum(scoreList));
        dto.put("Wins", makeCounter(scoreList, 1.00));
        dto.put("Lose", makeCounter(scoreList, 0.00));
        dto.put("Tie", makeCounter(scoreList, 0.50));
        return dto;
    }

    private Map<String, List> makeFinalScoresDTO(Set<Score> scoreList) {
        Map<String, List> scoresList = new LinkedHashMap<>();
        List<Double> allScores = new ArrayList<>();
        for (Score score : scoreList) {
            allScores.add(score.getFinalScore());
        }
        scoresList.put("All Scores", allScores);
        return scoresList;
    }

    private Double makeSum(Set<Score> scoreList) {
        Double total = 0.00;
        for (Score score : scoreList) {
            total += score.getFinalScore();
        }
        return total;
    }

    private Integer makeCounter(Set<Score> scoreList, Double number) {
        Integer total = 0;
        for (Score score : scoreList) {
            if (score.getFinalScore().equals(number)) {
                total++;
            }
        }
        return total;
    }

    @RequestMapping(path = "/games/players/{gamePlayerId}/ships", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> getSetOfShips(@PathVariable Long gamePlayerId, Authentication authentication, @RequestBody Set<Ship> ships) {
        if (authentication == null) {
            return new ResponseEntity<Map<String, Object>>(errorMap("NO GAME PLAYER", "Join a game"), HttpStatus.UNAUTHORIZED);

        } else {
            Player player = playerRepository.findByUserName(authentication.getName());
            GamePlayer gamePlayer = gamePlayerRepository.findOne(gamePlayerId);
            if (gamePlayer.getShips().size() != 0 || gamePlayer.getId() != gamePlayerId || ships.size() > 5) {
                return new ResponseEntity<Map<String, Object>>(errorMap("ERROR", "you are not that game player, ships already placed or too many ships"), HttpStatus.FORBIDDEN);
            }
            if (checkShips(ships, gamePlayer)) {
                saveShips(ships, gamePlayer);
            } else {
                return new ResponseEntity<Map<String, Object>>(errorMap("ERROR", "ships not well located"), HttpStatus.FORBIDDEN);
            }

        }
        return new ResponseEntity<Map<String, Object>>(errorMap("CREATED", "Join a game"), HttpStatus.OK);
    }

    public boolean checkShips(Set<Ship> ships, GamePlayer gamePlayer) {
        List<String> locationsOk = new ArrayList<>();
        for (Ship ship : ships) {
            List<String> locations = ship.getLocations();
            for (String location : locations) {
                if (location.length() > 3) {
                    return false;
                } else if (location.length() < 2) {
                    return false;
                }
                char letter = location.charAt(0);
                String stringNumber = location.substring(1, location.length());
                Integer number = Integer.parseInt(stringNumber);
                if (letter < 'A' || letter > 'J') {
                    return false;
                }
                if (number < 0 || number > 10) {
                    return false;
                }
                if (locationsOk.contains(location)) {
                    return false;
                }
                locationsOk.add(location);
            }
        }
        return true;
    }

    public void saveShips(Set<Ship> ships, GamePlayer gamePlayer) {
        for (Ship ship : ships) {
            List<String> locations = ship.getLocations();
            String type = ship.getType();
            Ship newShip = new Ship(type, locations, gamePlayer);
            shipRepository.save(newShip);
        }
    }

    @RequestMapping(path = "/games/players/{gamePlayerId}/salvos", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> showSalvos(Authentication authentication, @PathVariable Long gamePlayerId, @RequestBody Salvo salvo) {
        GamePlayer gamePlayer = gamePlayerRepository.findOne(gamePlayerId);
        if (authentication == null) {
            return new ResponseEntity<Map<String, Object>>(errorMap("NO GAME PLAYER", "Log in please"), HttpStatus.UNAUTHORIZED);
        } else {
            // gamePlayer no es nulo??
            Player playerAuthenticated = playerRepository.findByUserName(authentication.getName());
            Long idOfCurrentPlayerOfGP = gamePlayer.getPlayer().getId();
                    if (idOfCurrentPlayerOfGP == playerAuthenticated.getId()){
                        if (checkSalvos(salvo, gamePlayer) == true){
                            Set<Salvo> salvos = gamePlayer.getSalvos();
                            int currentTurn = lastTurn (salvos) +1;
                            // DEFINIR TURNO
                            salvo.setTurnNumber(currentTurn);
                            salvo.setGamePlayer(gamePlayer);
                            salvoRepository.save(salvo);
                            return new ResponseEntity<Map<String, Object>>(errorMap("CREATED", "New salvo shot"), HttpStatus.OK);
                        } else {
                            return new ResponseEntity<Map<String, Object>>(errorMap("SHOOT AGAIN", "A location has been shot twice"), HttpStatus.FORBIDDEN);
                        }
                    }
        }
        return new ResponseEntity<Map<String, Object>>(errorMap("YOU ARE NOT THAT GAME PLAYER", "Start a game"), HttpStatus.FORBIDDEN);
    }

    private int lastTurn(Set <Salvo> salvos){
        if (salvos.isEmpty()) return 0;
        return salvos.stream()
                .sorted(Comparator.comparing(Salvo::getTurnNumber).reversed())
                .findFirst()
                .get().getTurnNumber();
    }

    private boolean checkSalvos (Salvo salvo, GamePlayer gamePlayer){
        Set<Salvo> salvosAlreadyFired = gamePlayer.getSalvos();
        List<String> locations = salvo.getLocations();
            for (String location : locations){
                for (Salvo salvoAlreadyFired : salvosAlreadyFired){
                    List<String> locationsOfSAF = salvoAlreadyFired.getLocations();
                    for (String locationOfSAF : locationsOfSAF){
                        if (location == locationOfSAF){
                            return false;
                        }
                    }
                }
            }
        return true;
    }
}