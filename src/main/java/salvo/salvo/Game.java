package salvo.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.CreatedDate;
import javax.persistence.*;
import java.util.*;

@Entity
public class Game {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private long id;

    @JsonIgnore
    @CreatedDate
    private Date createdDate = new Date();

    @JsonIgnore
    @OneToMany(mappedBy="game", fetch=FetchType.EAGER)
    private Set<GamePlayer> gamePlayers = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy="game", fetch=FetchType.EAGER)
    private Set<Score> scores = new HashSet<>();

    public Game() {
    }

    public long getId() {
        return id;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public Set<GamePlayer> getGamePlayers() {
        return gamePlayers;
    }

    public void setScores(Set<Score> scores) {
        this.scores = scores;
    }

    public Set<Score> getScores() {
        return scores;
    }

    public void addGamePlayer (GamePlayer gamePlayer) {
        gamePlayers.add(gamePlayer);
    }
}