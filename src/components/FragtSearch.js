import React from 'react';
import { api } from "../helpers";

import "./css/result.css";
export default class ScannerPage extends React.Component {
    state = {
        data: false,
        rnd: false,
    };

    componentDidMount()
    {
        this.findNumber(this.props.number);
    }

    componentDidUpdate(prevProps)
    {
        if(prevProps.number !== this.props.number || prevProps.rnd !== this.props.rnd)
        {
            this.findNumber(this.props.number);
        }
    }
    
    findNumber = async (number) => {
        if(number.length !== 8)
        {
            this.setState({
                data: {
                    error: true,
                    code: "NOT_VALID",
                },
            });
         return;   
        }
        let data = await api("find/" + number);
        this.setState({data});
    }

    fragtData = () => {
        let msgs = {
            "NO_SORT_KEY": "Addresse ikke fundet, tjek sorteringsnøgle!",
            "NO_ZIP"    : "Postnummer er uden for rutens område!",
            "NOT_FOUND" : "Fragtbrevsnummer ikke fundet!",
            "NOT_VALID" : "Forkert nummer scannet!",
        };
        let d = this.state.data;
        if(d.error)
        {
            return (<div className="center fragtMsg">
                <div className="iconCircle">
                    <i className="fa fa-times" aria-hidden="true"/>
                </div>
                {
                    msgs[d.code]
                }
            </div>);
        }
        let isPalle = d.maxAddressWeight > d.pakkeWeight;
        let name = d[isPalle ? "palleNavn" : "pakkeNavn"];
        return (<div className="searchResult">
            <h2>{name}</h2>
            <hr/>
            <div className="infoContainer">
                <div className="inlineTest">
                    <b>Rute:</b> {name}#{d[isPalle ? "palleBilID" : "pakkeBilID"]} [{isPalle ? "palle" : "pakke"}]
                </div>
                <div className="inlineTest">
                    <b>Fragtnr:</b> {d.fragtnr}
                </div>
                <div className="inlineTest">
                    <b>Max koli vægt:</b> {d.maxAddressWeight}kg
                </div>
                <div className="inlineTest">
                    <b>Addresse:</b> {d.fuldAddresse}
                </div>
                <div className="inlineTest">
                    <b>Kunde:</b> {d.kunde}
                </div>
                <div className="inlineTest">
                    <b>Postnr:</b> {d.postnr}
                </div>
            </div>
        </div>);
    }

    render(){
		return (<div className="resultContainer">
           {
               this.state.data ?
                this.fragtData()
               : "Loading.."
           }
        </div>);
	}
}