package salvo.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Entity
public class Player {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private long id;
    private String userName;
    private String password;

    @OneToMany(mappedBy="player", fetch=FetchType.EAGER)
    private Set<GamePlayer> gamePlayers = new HashSet<>();

    @OneToMany(mappedBy="player", fetch=FetchType.EAGER)
    private Set<Score> scores = new HashSet<>();

    public Player() {
    }

    public Player(String userName, String password) {
        this.userName = userName;
        this.password = password;
    }

    public long getId() {
        return id;
    }

    public String getUserName() {
        return userName;
    }

    public Set<GamePlayer> getGamePlayers() {
        return gamePlayers;
    }

    public void setScores(Set<Score> scores) {
        this.scores = scores;
    }

    public void addGamePlayer (GamePlayer gamePlayer) {
        gamePlayers.add(gamePlayer);
    }

    public Score getScore (Game game) {
        return scores.stream().filter(p-> p.getGame().getId() == game.getId()).findFirst().orElse(null);
    }

    public Set<Score> getScores() {
        return scores;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPassword() {
        return password;
    }


}
