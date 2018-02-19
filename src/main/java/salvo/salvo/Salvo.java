package salvo.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import javax.xml.stream.Location;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Salvo {

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlayer_id")
    private GamePlayer gamePlayer;

    @ElementCollection
    @Column(name="location")
    private List<String> locations = new ArrayList<>();

    private Integer turnNumber;

    public Salvo (){
    }

    public Salvo (Integer turnNumber, List<String> locations, GamePlayer gamePlayer){
        this.turnNumber = turnNumber;
        this.locations = locations;
        this.gamePlayer = gamePlayer;
    }

    public Integer getTurnNumber() {
        return turnNumber;
    }

    public List<String> getLocations() {
        return locations;
    }

    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }
}
