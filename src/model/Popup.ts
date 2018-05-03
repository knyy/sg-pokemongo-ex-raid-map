import { Content, Marker } from 'leaflet';
import * as moment from 'moment';

const rawDateFormat = process.env.REACT_APP_RAW_DATE_FORMAT;
const displayDateFormat = process.env.REACT_APP_DISPLAY_DATE_FORMAT;
const displayTimeFormat = process.env.REACT_APP_DISPLAY_TIME_FORMAT;

export const renderPopup = ({ cellLevel }: { cellLevel: number }) => (
	layer: Marker
): Content => {
	const feature = layer.feature;
	const dates = feature.properties.dates;
	let lngLat = feature.geometry.coordinates;
	lngLat = lngLat.map((x: number) => Math.round(x * 10e6) / 10e6);

	let exraidHTML = '';
	if (dates && dates.length > 0) {
		dates
			.sort(
				(a: string, b: string) =>
					moment(b, rawDateFormat, true).unix() -
					moment(a, rawDateFormat, true).unix()
			)
			.forEach((date: string) => {
				const datetime = moment(date, rawDateFormat, true);
				const hasTime = displayTimeFormat && datetime.hour() > 0;
				exraidHTML += `<li>
                    <span>${datetime.format(displayDateFormat)}</span>
                    <span style="width: 20px;"></span>
                    <span>${
						hasTime
							? ` ${datetime.format(displayTimeFormat)} - 
                        ${datetime
							.add(45, 'minutes')
							.format(displayTimeFormat)}`
							: ''
					}</span>
                    </li>`;
			});
		exraidHTML = '<div>EX-raid(s):<ul>' + exraidHTML;
		exraidHTML += '</ul></div>';
	} else {
		exraidHTML += '<div>No EX-raid yet</div>';
	}

	if (cellLevel) {
		exraidHTML += `<div>S2 L${cellLevel} Cell: ${
			feature.properties[`S2L${cellLevel}`]
		}</div>`;
	}

	const label = process.env.REACT_APP_MAP_LINK_LABEL;
	const url = (process.env.REACT_APP_MAP_LINK_URL || '')
		.replace('{lng}', String(lngLat[1]))
		.replace('{lat}', String(lngLat[0]));

	let extraLink = '';
	if (label && url) {
		extraLink = `
            <div>
                <a target="_blank" href="${url}">${label}</a>
            </div>
        `;
	}

	return `
        <strong>
            ${feature.properties.name}
        </strong>
        ${exraidHTML}
        <br/>
        <div>
            <a target="_blank" href="
            https://www.google.com/maps/search/?api=1&query=${lngLat[1]},${
		lngLat[0]
	}
            ">Google Maps</a>
        </div>
        <br/>
        ${extraLink}
    `;
};