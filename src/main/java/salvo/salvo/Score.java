package salvo.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.CreatedDate;

import javax.persistence.*;
import java.util.Date;

@Entity
public class Score {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="player_id")
    private Player player;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="game_id")
    private Game game;

    private Double finalScore;

    @JsonIgnore
    @CreatedDate
    private Date finishedDate = new Date();

    public Score () {
    }

    public Score(Player player, Game game, Double finalScore) {
        this.player = player;
        this.game = game;
        this.finalScore = finalScore;
    }

    public Player getPlayer() {
        return player;
    }

    public Game getGame() {
        return game;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public Double getFinalScore() {
        return finalScore;
    }
}
