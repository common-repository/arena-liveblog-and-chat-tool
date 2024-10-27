/**
 * BLOCK: arena-block
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import './editor.scss';
import './style.scss';
import Event from './Event';

const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks
const { Component, createPortal } = wp.element;

class ArenaPortal extends Component {
  render () {
    const { el } = this.props

    return createPortal(
      this.props.children,
      el || document.body,
    )
  }
}

/**
 * Register: aa Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType( 'arena-blocks/block-arena-block', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Liveblog' ), // Block title.
	icon: 'welcome-write-blog', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'arena-blocks', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__( 'arena-block — CGB Block' ),
		__( 'CGB Example' ),
		__( 'create-guten-block' ),
	],
	attributes: {
		embedCode: {
			source: 'attribute',
			attribute: 'data-embed-code',
			selector: 'div[data-embed-code]',
		},
		eventImage: {
			source: 'attribute',
			attribute: 'data-event-image',
			selector: 'div[data-event-image]',
		},
		eventName: {
			source: 'attribute',
			attribute: 'data-event-name',
			selector: 'div[data-event-name]',
		},
		eventSlug: {
			source: 'attribute',
			attribute: 'data-event-slug',
			selector: 'div[data-event-slug]',
		},
	},

	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props Props.
	 * @returns {Mixed} JSX Component.
	 */
	edit: class extends Component {
		state = {
			events: null,
			images: window.albfreGutenData.getImages,
			translations: window.albfreGutenData.getTranslations,
			embedType: 'embed',
			currentPublisher: window.albfreGutenData.getCurrentPublisher,
			arenaConfig: window.albfreGutenData.getArenaConfig,
			searchText: '',
		}

		handleOpenModal = () => {
			this.fetchEvents();
			const modal = document.querySelector( '.albfre__arena-block__modal__container' );
			const modalContent = document.querySelector( '.albfre__arena-block__modal__content' );

			modal.style.visibility = 'visible';
			modal.style.opacity = '1';

			modalContent.style.transform = 'scale(1)';
		}

		handleCloseModal = () => {
			const modal = document.querySelector( '.albfre__arena-block__modal__container' );
			const modalContent = document.querySelector( '.albfre__arena-block__modal__content' );

			modal.style.visibility = 'hidden';
			modal.style.opacity = '0';

			modalContent.style.transform = 'scale(0.8)';
		}

		onKeyPressed = ( event ) => {
			if ( event.keyCode === 27 ) {
				this.handleCloseModal();
			}
		}

		dateIsAfterToday = ( date ) => {
			const tomorrow = new Date( new Date().getTime() + 24 * 60 * 60 * 1000 );
			tomorrow.setHours( 0, 0, 0, 0 );
			return date >= tomorrow;
		}

		dateIsSameToday = ( date ) => {
			const today = new Date();
			return ( date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear() );
		}

		getNextEvents = ( events ) => {
			const { translations } = this.state;
			const liveEvents = [];
			for ( let i = 0; i < events.length; i++ ) {
				const event = events[ i ];
				if ( event.status === 'live' || ( event.status !== 'done' && this.dateIsSameToday( new Date( event.startDate ) ) ) || this.dateIsAfterToday( new Date( event.startDate ) ) ) {
					if ( event.status === 'live' ) {
						event.badge = {
							id: 'live',
							name: translations.LIVE,
						};
					} else if ( this.dateIsSameToday( new Date( event.startDate ) ) ) {
						event.badge = {
							id: 'today',
							name: translations.TODAY,
						};
					} else if ( this.dateIsAfterToday( new Date( event.startDate ) ) ) {
						event.badge = {
							id: 'upcoming',
							name: translations.UPCOMING,
						};
					}
					liveEvents.push( event );
				}
			}

			return liveEvents;
		}

		fetchEvents = () => {
			const { arenaConfig, currentPublisher } = this.state;
			this.setState( { events: null } );
			window.fetch( `${ arenaConfig.ALBFRE_API_V2_BASE_URL }/account/sites/${ currentPublisher.siteId }/events`, {
				method: 'GET',
				headers: {
					authorization: `Bearer ${ currentPublisher.userToken }`,
					'content-type': 'application/json',
				},
			} )
				.then( async response => {
					const events = await response.json();

					this.setState( { events: this.getNextEvents( events ) } );
				} );
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
			const value = event.target.value;
			this.setState( {
				searchText: value,
			} );
		}

		addCode = ( event, { embedType, width, height, hundredWidth, hundredHeight } ) => {
			const { setAttributes } = this.props;
			const { images } = this.state

			const getSize = function( postfix ) {
				let widthValue = '100%';
				if ( ! hundredWidth ) {
					widthValue = width + postfix;
				}

				let heightValue = '100%';
				if ( ! hundredHeight ) {
					heightValue = height + postfix;
				}

				return { width: widthValue, height: heightValue };
			};

			let version = 1;
			if ( event.isFirestore ) {
				version = 2;
			}

			let embedCode;
			if ( embedType === 'amp' ) {
				const size = getSize( '' );

				embedCode = '[arena_embed_amp version="' + version + '" publisher="' + event.site.slug + '" event="' + event.slug + '" height="' + size.height + '"]';
			} else if ( embedType === 'iframe' ) {
				const size = getSize( 'px' );

				embedCode = '[arena_embed_iframe version="' + version + '" publisher="' + event.site.slug + '" event="' + event.slug + '" width="' + size.width + '" height="' + size.height + '"]';
			} else {
				embedCode = '[arena_embed version="' + version + '" publisher="' + event.site.slug + '" event="' + event.slug + '"]';
			}

			let eventImage;
			if ( event.avatarImage ) {
				eventImage = event.avatarImage;
			} else if ( event.officialEvent && event.officialEvent.image ) {
				eventImage = event.officialEvent.image;
			} else if (images[event.sport.id]) {
				eventImage = images[event.sport.id];
			} else {
				eventImage = 'https://dashboard.arena.im/img/empty-photo-event.png';
			}

			setAttributes( { embedCode, eventImage, eventName: event.name, eventSlug: event.slug } );

			this.handleCloseModal();
		}

		getEvents = ( ) => {
			const { events, arenaConfig, translations, searchText } = this.state;

			if ( events === null ) {
				return (
					<div className="albfre-list-events--list">
						<div className="albfre-sp albfre-sp-circle" />
					</div>
				);
			} else if ( events.length === 0 ) {
				return (
					<div className="albfre-events--empty">
						<span role="img" aria-label="calendar" className="albfre-events--empty--icon">📅</span>
						<div className="albfre-events--empty--title">{ translations.EMPTY_TITLE }</div>
						<div className="albfre-events--empty--subtitle">{ translations.EMPTY_SUBTITLE }</div>
						<a href={ arenaConfig.ALBFRE_DASHBOARD_URL } target="_blank" rel="noopener noreferrer" className="albfre-events--empty--btn">
							{ translations.EMPTY_BUTTON }
						</a>
					</div>
				);
			}

			const filteredEvents = events
				.filter( event => event.name.toLowerCase().includes( searchText.toLowerCase() ) );

			const eventsComponents = filteredEvents
				.map( event => (
					<Event key={ event.slug } event={ event } translations={ translations } addCode={ this.addCode } />
				) );

			return <div className="albfre-list-events--list">{ eventsComponents }</div>;
		}

		refreshPage = () => {
			this.fetchEvents();
		}

		formatAMPM( date ) {
			let hours = date.getHours();
			let minutes = date.getMinutes();
			const ampm = hours >= 12 ? 'pm' : 'am';
			hours = hours % 12;
			hours = hours ? hours : 12; // the hour '0' should be '12'
			minutes = minutes < 10 ? '0' + minutes : minutes;
			const strTime = hours + ':' + minutes + ' ' + ampm;
			return strTime;
		}

		getModal = () => {
			const { images, translations, arenaConfig, searchText } = this.state;

			return (
				<div
					tabIndex="0"
					role="button"
					onClick={ this.handleCloseModal }
					onKeyDown={ this.onKeyPressed }
					className="albfre__arena-block__modal__container"
				>
					<div
						tabIndex="0"
						role="button"
						onClick={ event => event.stopPropagation() }
						onKeyDown={ () => {} }
						className="albfre__arena-block__modal__content"
					>
						<div
							className="albfre__arena-block__modal__content__header"
						>
							<div>Arena Events</div>
							<div
								tabIndex="0"
								role="button"
								onClick={ this.handleCloseModal }
								onKeyDown={ this.onKeyPressed }
								className="albfre__arena-block__modal__content__close"
							>
								<img src={ images.iconClose } alt="close" />
							</div>
						</div>
						<header className="albfre-list-events--header">
							<a href={ arenaConfig.ALBFRE_DASHBOARD_URL } target="_blank" rel="noopener noreferrer" className="albfre-list-events--header--logo">
								<img alt="logo" src={ images.eventsLogoImage } srcSet={ images.eventsLogo2xImage } />
							</a>
							<div className="albfre-list-events--header--search--input--wrapper">
								<input
									type="text"
									className="albfre-list-events--header--search--input"
									placeholder={ translations.Search }
									onChange={ e => this.setState( { searchText: e.target.value } ) }
									value={ searchText }
								/>
								<span
									className="albfre-list-events--header--search--input--icon"
									style={ {
										background: `url(${ images.ionSearchIonicons }) center center / contain no-repeat`,
									} }
								/>
							</div>
							<button onClick={ this.refreshPage } className="albfre-list-events--header--reload">
								<img alt="reload" src={ images.iconReload } />
							</button>
						</header>
						{ this.getEvents() }
					</div>
				</div>
			);
		}

		render() {
			const { attributes } = this.props;
			const { images, arenaConfig, currentPublisher, translations } = this.state;

			if (!currentPublisher.userToken) {
				return (
					<div class="albfre-list-events--login">
						<div class="albfre-list-events--login--wrapper">
							<div class="albfre-list-events--login--title">
								{translations['Add your events']}
							</div>
							<div class="albfre-list-events--login--description">
								{translations["In order to see the events you've created on Arena.im, you must log in on Settings > Arena."]}
							</div>
							<a href={arenaConfig.ALBFRE_ARENA_SETTINGS} class="albfre-list-events--login--button">LOG IN</a>
						</div>
					</div>
				)
			}

 			return (
				<div className={ this.props.className }>
					<div className="albfre__arena-block__container">
						<div className="albfre__arena-block__logo">
							<img src={ images.logoImage } alt="" />
						</div>
						{ attributes.embedCode ? (
							<div className="albfre__arena-block__event">
								<div
									className="albfre__arena-block__event__image"
									style={{
										background: `url(${ attributes.eventImage }) 50% / cover`,
									}}
								>
									<div className="albfre__arena-block__event__menu">
										<a href={ `${ arenaConfig.ALBFRE_DASHBOARD_URL }/live/${ attributes.eventSlug }` } target="_blank" className="albfre__arena-block__event__menu__item">
											VIEW
										</a>
										<a href={ `${ arenaConfig.ALBFRE_DASHBOARD_URL }/new/${ attributes.eventSlug }` } target="_blank" className="albfre__arena-block__event__menu__item">
											EDIT
										</a>
										<a href={ `${ arenaConfig.ALBFRE_DASHBOARD_URL }/live/${ attributes.eventSlug }/analytics` } target="_blank" className="albfre__arena-block__event__menu__item">
											ANALYTICS
										</a>
									</div>
								</div>
								<div className="albfre__arena-block__event__name">
									{ attributes.eventName }
								</div>
							</div>
						) : (
							<div>
								<button
									onClick={ this.handleOpenModal }
									className="albfre__arena-block__button"
								>
								SELECT LIVEBLOG
								</button>
								<a href={ `${ arenaConfig.ALBFRE_DASHBOARD_URL }/new` } target="_blank" className="albfre__arena-block__button">
								CREATE A NEW LIVEBLOG
								</a>

							</div>
						) }

					</div>
					<ArenaPortal>
						{ this.getModal() }
					</ArenaPortal>
				</div>
			);
		}
	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props Props.
	 * @returns {Mixed} JSX Frontend HTML.
	 */
	save: ( { attributes: { embedCode, eventImage, eventName, eventSlug } } ) => {
		return (
			<div data-embed-code={ embedCode } data-event-image={ eventImage } data-event-name={ eventName } data-event-slug={ eventSlug }>
				{ embedCode }
			</div>
		);
	},
} );
