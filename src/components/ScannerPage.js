import React from 'react';
import FragtSearch from "./FragtSearch";

import loaderSvg from "./images/loader.svg";
import "./css/search.css";
export default class ScannerPage extends React.Component {
    state = {
        fragt: false,
        isUpdating: false,
        version: "",

        showSettings: false,
        checkPass: false
    };
    electron = null;
    searchTimer = null;

    componentDidMount() {
        document.addEventListener("keydown", this.focusSearch);
        this.refs.nr.addEventListener("blur", this.clearSearch);

        this.electron = window.require("electron");
        this.syncElectron();
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
        console.log(e);
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
        this.setState({
            fragt: this.refs.nr.value,
            rnd: Date.now(),
        });
        this.refs.nr.value = "";
    }

    simplePassCheck = (e) => {
        let state = {
            checkPass: false
        };
        let check = parseInt(e.target.value, 32);
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
            <div className="settings" onClick={() => this.setState({checkPass: !this.state.checkPass})}>
                <div className="fa fa-cog"/>
            </div>
            {
                this.state.checkPass ?
                    <div className="settings">
                        <input placeholder="Adgangskode" type="password" onBlur={this.simplePassCheck} data-noauto="1"/>
                    </div>
                : null
            }
            {
                this.state.showSettings ? 
                <div className="settingsMenu">
                    <button onClick={() => this.electron.ipcRenderer.send('run_startup')}>Run startup.reg</button>
                    <button onClick={() => this.electron.ipcRenderer.send('exit_kiosk')}>Exit kiosk</button>
                    <button onClick={() => this.setState({showSettings: false})}>Close settings</button>
                </div>
                : null
            }
                
            
            {
                this.state.fragt && this.state.fragt.length > 0 ?
                    <FragtSearch number={this.state.fragt} rnd={this.state.rnd}/>
                : 
                <div className="barcodeContainer">
                    <i className="fa fa-barcode" aria-hidden="true"></i>
                    <div className="barcodeHelperText">
                        Scan stregkode for at søge
                    </div>
                </div>
            }
            <div className="version">
                {this.state.version}
            </div>
            <div className="centerMsg" style={this.state.isUpdating ? {} : {display: "none"}}>
                <img src={loaderSvg} alt="loading"/> Appen opdateres..
            </div>
        </div>);
	}
}