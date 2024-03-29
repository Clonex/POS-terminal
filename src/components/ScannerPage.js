import React from 'react';
import FragtSearch from "./FragtSearch";
import Battery from "./Battery";


import loaderSvg from "./images/loader.svg";
import { doKey, api } from "../helpers";
import "./css/search.css";
export default class ScannerPage extends React.Component {
    state = {
        fragt: false,
        isUpdating: false,
        version: "",

        showSettings: false,
        showKeyboard: true,
        checkPass: false,
        lastSync: false,
        isNew: false,
    };
    electron = null;
    searchTimer = null;
    lookupTable = {};

    componentDidMount() {
        document.addEventListener("keydown", this.focusSearch);
        this.refs.nr.addEventListener("blur", this.clearSearch);

        this.electron = window.require("electron");
        this.syncElectron();
        this.setupNew();
    }


    setupNew()
    {
        this.setState({
            isNew: true
        });
        this.syncTable();
        setInterval(() => this.syncTable(), 1000 * 60 * 15);
    }

    async syncTable()
    {
        const data = await api("getKolis");
        if(data && !data.error && Object.keys(data.data).length > 0)
        {
            this.lookupTable = data.data;
            this.setState({
                lastSync: Date.now(),
            });
        }
    }

    syncElectron(){
        this.electron.ipcRenderer.send('app_version');
        this.electron.ipcRenderer.on('app_version', (event, arg) => {
            this.electron.ipcRenderer.removeAllListeners('app_version');
            this.setState({version: arg.version});
        });
        this.electron.ipcRenderer.on('update_available', () => {
            this.electron.ipcRenderer.removeAllListeners('update_available');
            this.setState({isUpdating: true});
        });
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.focusSearch);
        this.refs.nr.addEventListener("blur", this.clearSearch);

    }

    focusSearch = (e) => {
        if(e.target.dataset && e.target.dataset.noauto && e.target.dataset.noauto == "1")
        {
            return;
        }
        this.refs.nr.focus();
        if(this.searchTimer)
        {
            window.clearTimeout(this.searchTimer);
        }
        this.searchTimer = window.setTimeout(() => {
            this.searchTimer = null;
            this.search();
        }, 100);

    }

    clearSearch = () => {
        setTimeout(() => {
            this.refs.nr.value = "";
        }, 150);
    }

    search = (e) => {
        if(e)
        {
            e.preventDefault();
        }
        const fragt = this.refs.nr.value;
        if(fragt.length === 0)
        {
            return;
        }
        if(fragt.toLowerCase() === "porestartpo") //Restart
        {
            this.electron.ipcRenderer.send('restart');
        }else if(fragt.toLowerCase() === "poshutdownpo") //Shutdown
        {
            this.electron.ipcRenderer.send('shutdown');
        }else{
            this.setState({
                fragt,
                rnd: Date.now(),
            });
        }
        this.refs.nr.value = "";
    }

    simplePassCheck = (ref) => {
        let state = {
            checkPass: false
        };
        let check = parseInt(ref.value, 32);
        console.log("Pass", check);
        if(check === 103055393)
        {
            state.showSettings = true;
        }
        this.setState(state);
    }
    
    render(){
		return (<div className="center full-vh">
            <form onSubmit={this.search} action="" className="searchInput">
                <input placeholder="Fragtbrevsnummer" ref="nr"/>
                <input type="submit" value="Søg"/>
            </form>
            <Battery/>
            <div className="settings" onClick={() => {
                this.setState({checkPass: !this.state.checkPass});
                requestAnimationFrame(() => this.refs.pass.focus());
            }}>
                <div className="fa fa-cog"/>
            </div>
            {
                this.state.checkPass ?
                    <div className="settings">
                        <form onSubmit={() => this.simplePassCheck(this.refs.pass)}>
                            <input placeholder="Adgangskode" ref="pass" type="password" data-noauto="1"/>
                        </form>
                    </div>
                : null
            }
            {
                this.state.showSettings ? 
                <div className="settingsMenu">
                    <button onClick={() => this.electron.ipcRenderer.send('run_startup')}>Run startup.reg</button>
                    <button onClick={() => this.electron.ipcRenderer.send('run_enable')}>Re-enable explorer</button>
                    <button onClick={() => this.electron.ipcRenderer.send('restart')}>Restart</button>
                    <button onClick={() => this.electron.ipcRenderer.send('shutdown')}>Shutdown</button>
                    <button onClick={() => this.electron.ipcRenderer.send('check_update')}>Force update check</button>
                    <button onClick={() => this.electron.ipcRenderer.send('exit_kiosk')}>Exit kiosk</button>
                    <button onClick={() => this.setState({showSettings: false})}>Close settings</button>
                </div>
                : null
            }
            {
                this.state.checkPass ? 
                <div className="keyboard">
                    {
                        "1234567890".split("").map(d => <button key={d} onClick={() => requestAnimationFrame(() => doKey(d, this.refs.pass))}>{d}</button>)
                    }
                    <button className="fourth" onClick={() => doKey(-1, this.refs.pass)}>&#x3c;</button>
                    <button className="fourth" onClick={() => this.simplePassCheck(this.refs.pass)}>Send</button>
                    <button className="fourth" onClick={this.simplePassCheck}><b style={{fontSize: 42}}>Luk</b></button>
                </div>
                : null
            }
            
            {
                this.state.fragt && this.state.fragt.length > 0 ?
                    <FragtSearch number={this.state.fragt} rnd={this.state.rnd} useLocal={this.state.isNew} store={this.lookupTable}/>
                : 
                <div className="barcodeContainer">
                    <i className="fa fa-barcode" aria-hidden="true"></i>
                    <div className="barcodeHelperText">
                        Scan stregkode for at søge
                    </div>
                </div>
            }
            <div className="version">
                {this.state.version} {this.state.lastSync && " - " + (new Date(this.state.lastSync).toLocaleTimeString())}
            </div>
            <div className="centerMsg" style={this.state.isUpdating ? {} : {display: "none"}}>
                <img src={loaderSvg} alt="loading"/> Appen opdateres..
            </div>
        </div>);
	}
}