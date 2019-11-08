import React from 'react';
import FragtSearch from "./FragtSearch";

import loaderSvg from "./images/loader.svg";
import "./css/search.css";
export default class ScannerPage extends React.Component {
    state = {
        fragt: false,
        isUpdating: false,
        version: "",
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

    focusSearch = () => {
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
    
    render(){
		return (<div className="center full-vh">
            <form onSubmit={this.search} action="" className="searchInput">
                <input placeholder="Fragtbrevsnummer" ref="nr"/>
                <input type="submit" value="Søg"/>
            </form>
            
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
            {
                this.state.isUpdating ?
                <div className="centerMsg">
                    <img src={loaderSvg} alt="loading"/> Appen opdateres..
                </div>
                : null
            }
        </div>);
	}
}