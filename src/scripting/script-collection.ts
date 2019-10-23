import IVM from "isolated-vm";
import _ from "lodash";
import Script from "scripting/script";
import ScriptRunner from "scripting/script-runner";
import ArgumentParser from "../core/argument-parser";

// TODO: Change Scriptwise System to pass in the scripts directly instead of a list of directories
// TODO: Rename scriptwise system to something... other than a system

export default class ScriptCollection {
    public scriptRunner: ScriptRunner;
    private _prebuiltScripts: {[name: string]: Script};
    constructor(prebuiltScripts: {[name: string]: string}, addIns?: {[s: string]: object}) {
        this.scriptRunner = new ScriptRunner();
        this._prebuiltScripts = this.scriptRunner.buildManySync(prebuiltScripts, addIns);
    }
    public async runScript(
            code: string,
            args: string,
            entityValue?: IVM.Reference<any>,
            playerValue?: IVM.Reference<any>,
            moduleResolutionHandler?: (specifier: string, referrer: IVM.Module) => IVM.Module) {
        const argsArray = ArgumentParser.parse(args);
        return this.scriptRunner.build(
            code,
            {
                args: argsArray,
                entity: entityValue === undefined ? undefined : entityValue.derefInto(),
                me: playerValue === undefined ? undefined : playerValue.derefInto()
            },
            moduleResolutionHandler,
            undefined,
            500,
            this._prebuiltScripts
        );
    }
    public convert(obj: any) {
        return new IVM.ExternalCopy(obj).copyInto();
    }
    public execute(scriptPath: string, name: string, ...params: any) {
        const script = this.getScript(scriptPath);
        return script.execute(name, ...params);
    }
    public executeReturnRef(scriptPath: string, name: string, ...params: any) {
        const funcRef = this.getScript(scriptPath).getReference(name);
        const context = this.getScript(scriptPath).context;
        const script = `
            export function run(func, ...args) {return new IVM.Reference(func(...args))};
        `;
        const tmpScript = this.scriptRunner.buildSync(script, {IVM}, undefined, context);
        const res = tmpScript.execute("run", funcRef.derefInto(), ...params);
        if (res.typeof === "undefined") {
            console.log("ref is undefined");
            return undefined;
        }
        return res;
    }
    public get(scriptPath: string, name: string): any {
        const script = this.getScript(scriptPath);
        return script.get(name);
    }
    public runIVMScript(scriptPath: string, script: string) {
        const context = this.getScript(scriptPath).context;
        return this.scriptRunner.buildSync(script, {IVM}, undefined, context);
    }
    public getScript(scriptPath: string) {
        const script = this._prebuiltScripts[scriptPath];
        if (script === undefined) {
            throw new Error("Component at path " + scriptPath + " could not be found.");
        }
        return script;
    }
}