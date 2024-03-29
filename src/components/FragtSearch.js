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
        // console.log("Search", number);
        
        let data = {};
        if(this.props.useLocal && this.props.store)
        {
            // console.log("Ranke", number, this.props.store[number]);
            data.ranke = this.props.store[number];
            if(!data.ranke)
            {
                const temp = await api("findNew/" + number);
                if(temp)
                {
                    if(temp.error)
                    {
                        data.error = true;
                        data.code = temp.code;
                    }else{
                        data = temp.data;
                    }
                }else{
                    data.error = true;
                    data.code = "NO_WIFI";
                }
                // data.code = "NOT_FOUND";
            }
            // return;
        }else{
            let koliCheck = false;
            if(number.length === 28)
            {
                number = number.substring(20);
                koliCheck = true;
            }else if(number.length !== 8)
            {
                this.setState({
                    data: {
                        error: true,
                        code: "NOT_VALID",
                    },
                });
            return;   
            }
            try {
                data = await api("find/" + number);
                if(data.error && koliCheck)
                {
                    data.code = "NOT_VALID";
                }
            } catch (error) {
                data.error = true;
                data.code = "NO_WIFI";
            }
        }
        this.setState({data});
    }

    fragtData = () => {
        let msgs = {
            "NO_SORT_KEY": "Addresse ikke fundet, tjek sorteringsnøgle!",
            "NO_ZIP"    : "Postnummer er uden for rutens område!",
            "NOT_FOUND" : "Nummeret blev ikke fundet!",
            "NOT_VALID" : "Forkert nummer scannet!",
            "NO_WIFI" : "Dårlig forbindelse!",
            "WEIRD_BUG" : "Der skete en fejl!",
        };
        let d = this.state.data;
        if(d.error)
        {
            return (<div className="center fragtMsg">
                <div className="iconCircle">
                    <i className="fa fa-times" aria-hidden="true"/>
                </div>
                {
                    msgs[d.code] ? msgs[d.code] : msgs["WEIRD_BUG"]
                }
            </div>);
        }

        if(this.props.useLocal)
        {
            return (<div className="searchResult">
                <h2 style={{fontSize: "158px"}}>{d.ranke}</h2>
            </div>);
        }

        let isPalle = d.maxAddressWeight > d.pakkeWeight;
        let name = d[isPalle ? "palleNavn" : "pakkeNavn"];
        let port = d[isPalle ? "pallePort" : "pakkePort"];
        return (<div className="searchResult">
            {
                port && <h2>Port {port}</h2>
            }
            <h2>{name}</h2>
            <h2>{d.fragtnr}</h2>
            {/* <div className="infoContainer">
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
            </div> */}
        </div>);
    }

    render(){
		return (<div className={`resultContainer ${this.state.data && this.state.data.error ? (this.state.data.code === "NO_WIFI" ? "wifiError" : "error") : ""}`}>
           {
               this.state.data ?
                this.fragtData()
               : "Loading.."
           }
        </div>);
	}
}