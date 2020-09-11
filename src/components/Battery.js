import React from 'react';
import "./css/battery.css";
export default class Battery extends React.Component {
    state = {
        percent: 100,
    };

    componentDidMount() {
        navigator.getBattery().then(battery => {
            this.setState({
                percent: battery.level * 100
            });
        });
        setInterval(this.getBattery, 3 * 60 * 1000);
    }

    getBattery = () => {
        navigator.getBattery().then(battery => {
            this.setState({
                percent: battery.level * 100
            });
        });
    }
    
    render(){
        let color = "green";
        if(this.state.percent < 20)
        {
            color = "red";
        }else if(this.state.percent < 50)
        {
            color = "yellow";
        }
		return (<div className={"battery " + color}>
            {this.state.percent}%
        </div>);
	}
}