import TruePlayer from "scripts/player";

let player!: TruePlayer;

beforeEach(() => {
    player = new TruePlayer("testPlayerID", "testPlayer", "Test Player", {
        38: "up",
        40: "down",
        37: "left",
        39: "right"
    });
});

describe("Player", () => {
    test("can convert input", () => {
        const convertedInput = player.convertInput(38);
        expect(convertedInput).toEqual("up");
    });

    test("will return undefined on converting unknown input", () => {
        const convertedInput = player.convertInput(41);
        expect(convertedInput).toEqual(undefined);
    });
});
