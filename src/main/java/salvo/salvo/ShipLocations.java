package salvo.salvo;

import javax.persistence.Embeddable;

@Embeddable
public class ShipLocations {

    private long shipID;
    private String cell;

    public ShipLocations() {
    }
}
