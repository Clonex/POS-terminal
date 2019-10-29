import React from 'react';
import FragtSearch from "./FragtSearch";

import "./css/search.css";
export default class ScannerPage extends React.Component {
    state = {
        fragt: false
    };

    componentDidMount() {
        document.addEventListener("keydown", this.focusSearch);
        this.refs.nr.addEventListener("blur", this.clearSearch);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.focusSearch);
        this.refs.nr.addEventListener("blur", this.clearSearch);

    }

    focusSearch = () => {
        this.refs.nr.focus();
    }

    clearSearch = () => {
        setTimeout(() => {
            this.refs.nr.value = "";
        }, 150);
    }

    search = (e) => {
        e.preventDefault();
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
                        Scan stregkode for at søge TEST
                    </div>
                </div>
            }
        </div>);
	}
}