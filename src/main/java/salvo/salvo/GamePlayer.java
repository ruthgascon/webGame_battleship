package salvo.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.CreatedDate;
import javax.persistence.*;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
public class GamePlayer {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private long id;

    @JsonIgnore
    @CreatedDate
    private Date joinDate = new Date();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="player_id")
    private Player player;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="game_id")
    private Game game;

    @JsonIgnore
    @OneToMany(mappedBy="gamePlayer", fetch=FetchType.EAGER)
    Set<Ship> ships = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy="gamePlayer", fetch=FetchType.EAGER)
    Set<Salvo> salvoes = new HashSet<>();

    public GamePlayer() { }

    public GamePlayer(Player player, Game game) {
        this.player = player;
        this.game = game;
        player.addGamePlayer(this);
        game.addGamePlayer(this);
    }

    public long getId() {
        return id;
    }

    public Player getPlayer() {
        return player;
    }

    public Game getGame() {
        return game;
    }

    public Date getJoinDate() {
        return joinDate;
    }

    public void addShips (Ship ship) {
        ships.add(ship);
    }

    public Set<Ship> getShips() {
        return ships;
    }

    public Set<Salvo> getSalvos() {
        return salvoes;
    }

    public Score getScore(){
        return player.getScore(game);
    }

}
