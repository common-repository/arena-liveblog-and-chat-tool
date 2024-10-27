const { Component } = wp.element;

export default class Event extends Component {
	state = {
		embedType: 'embed',
		width: 400,
		height: 400,
		hundredWidth: false,
		hundredHeight: false,
	}

	formatAMPM = ( date ) => {
		let hours = date.getHours();
		let minutes = date.getMinutes();
		const ampm = hours >= 12 ? 'pm' : 'am';
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? '0' + minutes : minutes;
		const strTime = hours + ':' + minutes + ' ' + ampm;
		return strTime;
	}

	getEventStartDate = ( startDate ) => {
		const monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December',
		];
		const date = new Date( startDate );
		return {
			day: date.getDate(),
			month: monthNames[ date.getMonth() ],
			year: date.getFullYear(),
			time: this.formatAMPM( date ),
		};
	}

	handleTypeChange = ( event ) => {
		this.setState( {
			embedType: event.target.value,
		} );
	}

	handleAddCode = ( event ) => {
		const { addCode } = this.props;
		const { embedType, width, height, hundredWidth, hundredHeight } = this.state;

		addCode( event, { embedType, width, height, hundredWidth, hundredHeight } );
	}

	render() {
		const { embedType, width, height, hundredWidth, hundredHeight } = this.state;
		const { event, translations } = this.props;
		const startDate = this.getEventStartDate( event.startDate );
		let nameStyle = {};
		if ( event.badge.name.length >= 7 ) {
			nameStyle = { fontSize: '9px' };
		}

		const slug = '' + event.slug;

		let avataImage;
		if ( event.avatarImage ) {
			avataImage = event.avatarImage;
		} else if ( event.officialEvent && event.officialEvent.image ) {
			avataImage = event.officialEvent.image;
		} else {
			avataImage = 'https://dashboard.arena.im/img/empty-photo-event.png';
		}

		let teams = null;

		if ( event &&
			event.scores &&
			event.scores.length &&
			event.scores[ 0 ].teamA &&
			event.scores[ 0 ].teamA.image &&
			event.scores[ 0 ].teamA.abbreviation &&
			event.scores[ 0 ].teamB &&
			event.scores[ 0 ].teamB.image &&
			event.scores[ 0 ].teamB.abbreviation
		) {
			teams = {
				teamA: event.scores[ 0 ].teamA,
				teamB: event.scores[ 0 ].teamB,
			};
		}

		return (
			<div className="albfre-events--item--wrapper">
				<div className="albfre-events-badge--wrapper">
					<div className="albfre-events-upcoming-wrapper">
						<div
							className={ `albfre-events-badge albfre-events-badge-${ event.badge.id }` }
							style={ nameStyle }>
							{ event.badge.name }
						</div>
					</div>
					<div className="albfre-events-badge--date">
						<div className="albfre-events-badge--date--day">{ startDate.day }</div>
						<div className="albfre-events-badge--date--month">{ startDate.month }</div>
						<div className="albfre-events-badge--date--hour ">{ startDate.time }</div>
					</div>
				</div>
				<div className="albfre-events--item--container">
					<div className="albfre-events--item">
						{ teams !== null ? (
							<div className="albfre-events--item--match">
								<div className="albfre-events--item--team">
									<div
										className="albfre-events--item--team--logo"
										style={ { background: `url(${ teams.teamA.image }) center center / contain no-repeat` } }
									/>
									<div
										className="albfre-events--item--team--name"
									>
										{ teams.teamA.abbreviation }
									</div>
								</div>
								<div className="albfre-events--item--match--vs">x</div>
								<div className="albfre-events--item--team">
									<div
										className="albfre-events--item--team--logo"
										style={ { background: `url(${ teams.teamB.image }) center center / contain no-repeat` } }
									/>
									<div className="albfre-events--item--team--name">
										{ teams.teamB.abbreviation }
									</div>
								</div>
							</div>
						) : (
							<div
								className="albfre-events--item--img"
								style={ { background: `url(${ avataImage }) center center / cover` } }
							/>
						) }
						<div className="albfre-events--item--info--wrapper">
							<div className="albfre-events--item--info">
								<div className="albfre-events--item--info--title">{ event.name }</div>
								<div className="albfre-events--item--subinfo">
									<div className="albfre-events--item--info--subtitle">
										{ event.tournament ? event.tournament.name : '' }
									</div>
								</div>
							</div>
							<div className="albfre-events--item--ctas btn-toolbar">
								<select
									value={ embedType }
									onChange={ this.handleTypeChange }
									className={ `albfre-events--item--info--ctas--type albfre-events--item--info--ctas--type-${ slug }` }
								>
									<option value="embed">Embed</option>
									<option value="amp">AMP</option>
									<option value="iframe">iframe</option>
								</select>
								<button
									className="albfre-btn albfre-btn-arena-secondary"
									onClick={ () => this.handleAddCode( event ) }>
									<span>{ translations.ADD }</span>
								</button>
							</div>
						</div>
					</div>
					{ ( embedType === 'iframe' || embedType === 'amp' ) &&
						<div className="albfre-events--item--size">
							<div className="albfre-events--item--size--item albfre-events--item--size--width">
								<span className="albfre-events--item--size--item--label">
										Width
								</span>
								<input
									disabled={ hundredWidth }
									type="number"
									className="albfre-events--item--size--item--input"
									value={ width }
									onChange={ e => this.setState( { width: e.target.value } ) }
								/>
								<input
									type="checkbox"
									checked={ hundredWidth }
									className="albfre-events--item--size--item--check"
									onChange={ () => this.setState( ( { hundredWidth } ) => ( { hundredWidth: ! hundredWidth } ) ) }
								/>
								<span className="albfre-events--item--size--item--hundred">100%</span>
							</div>
							<div className="albfre-events--item--size--item">
								<span className="albfre-events--item--size--item--label">
										Height
								</span>
								<input
									disabled={ hundredHeight }
									type="number"
									onChange={ e => this.setState( { height: e.target.value } ) }
									className="albfre-events--item--size--item--input"
									value={ height }
								/>
								<input
									type="checkbox"
									checked={ hundredHeight }
									className="albfre-events--item--size--item--check albfre-events--item--size-height-100-'+slug+'"
									onChange={ () => this.setState( ( { hundredHeight } ) => ( { hundredHeight: ! hundredHeight } ) ) }
								/>
								<span className="albfre-events--item--size--item--hundred">
										100%
								</span>
							</div>
						</div>
					}
				</div>
			</div>
		);
	}
}
