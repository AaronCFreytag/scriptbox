import ActionInstance from "action-instance";
import Aspect from "aspect";

interface FrameData {
    frame: string;
    duration: number;
}

export default class SimpleAnimation extends ActionInstance {
    public currentFrame: Aspect<string> = new Aspect<string>("");
    public onCreate(frames: FrameData[] = []) {
        super.onCreate();
        for (const frameData of frames) {
            this
                .do(() => {
                    this.currentFrame.base = frameData.frame;
                })
                .wait(frameData.duration);
        }
    }
    public onPostUpdate(delta: number) {
        super.onPostUpdate(delta);
    }
}
