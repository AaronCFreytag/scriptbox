import Player from "core/player";
import PlayerGroup from "core/player-group";
import NetEventHandler from "networking/net-event-handler";
import Networker from "networking/networker";
import ClientConnectionPacket from "networking/packets/client-connection-packet";
import ServerDisplayPacket from "networking/packets/server-display-packet";
import ServerEntityInspectionListingPacket from "networking/packets/server-entity-inspection-listing-packet";
import ServerMessage from "networking/server-messages/server-message";
import ServerNetEvent, { ServerEventType } from "networking/server-net-event";
import ComponentInfo from "resource-management/component-info";
import RenderObject from "resource-management/render-object";

import DisplaySystem from "./display-system";

export default class DisplaySystemNetworker extends Networker {
    private _displaySystem: DisplaySystem;
    constructor(displaySystem: DisplaySystem) {
        super();
        this.connectionDelegate = this.connectionDelegate.bind(this);

        this.onObjectDisplay = this.onObjectDisplay.bind(this);
        this.onEntityInspectionListing = this.onEntityInspectionListing.bind(this);

        this._displaySystem = displaySystem;
        this._displaySystem.onObjectDisplay(this.onObjectDisplay);
        this._displaySystem.onEntityInspection(this.onEntityInspectionListing);
    }
    public hookupInput(netEventHandler: NetEventHandler) {
        netEventHandler.addConnectionDelegate(this.connectionDelegate);
    }
    public connectionDelegate(packet: ClientConnectionPacket, player: Player) {
        this._displaySystem.sendFullDisplayToPlayer(player);
    }
    public onObjectDisplay(renderObjects: RenderObject[], playerGroup: PlayerGroup) {
        this.send(
            new ServerMessage(
                new ServerNetEvent(ServerEventType.DisplayPackage, new ServerDisplayPacket(renderObjects)),
                playerGroup
            )
        );
    }
    public onEntityInspectionListing(entityID: string, components: ComponentInfo[], playerGroup: PlayerGroup) {
        this.send(
            new ServerMessage(
                new ServerNetEvent(ServerEventType.EntityInspectListing, new ServerEntityInspectionListingPacket(
                    components,
                    entityID
                )),
                playerGroup
            )
        );
    }
}