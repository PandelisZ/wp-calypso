/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import { activateModule, deactivateModule } from 'state/jetpack/modules/actions';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isActivatingJetpackModule from 'state/selectors/is-activating-jetpack-module';
import isDeactivatingJetpackModule from 'state/selectors/is-deactivating-jetpack-module';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import SupportInfo from 'components/support-info';

class SpeedUpSiteSettings extends Component {
	static defaultProps = {
		togglingSiteAccelerator: false,
	};

	static propTypes = {
		fields: PropTypes.object,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		jetpackVersionSupportsLazyImages: PropTypes.bool,
		siteAcceleratorSupported: PropTypes.bool,
		activateModule: PropTypes.func,
		deactivateModule: PropTypes.func,

		// Connected props
		photonModuleUnavailable: PropTypes.bool,
		selectedSiteId: PropTypes.number,
		siteSlug: PropTypes.string,
		photonModuleActive: PropTypes.bool,
		assetCdnModuleActive: PropTypes.bool,
		togglingSiteAccelerator: PropTypes.bool,
	};

	handleCdnChange = () => {
		const { photonModuleActive, assetCdnModuleActive, selectedSiteId } = this.props;

		// Check if any of the CDN options are on.
		const cdnStatus = photonModuleActive || assetCdnModuleActive;

		// If one of them is on, we turn everything off.
		if ( true === cdnStatus ) {
			if ( false === ! photonModuleActive ) {
				this.props.deactivateModule( selectedSiteId, 'photon' );
			}
			if ( false === ! assetCdnModuleActive ) {
				this.props.deactivateModule( selectedSiteId, 'photon-cdn' );
			}
		} else {
			if ( false === photonModuleActive ) {
				this.props.activateModule( selectedSiteId, 'photon' );
			}
			if ( false === assetCdnModuleActive ) {
				this.props.activateModule( selectedSiteId, 'photon-cdn' );
			}
		}
	};

	render() {
		const {
			selectedSiteId,
			photonModuleUnavailable,
			isRequestingSettings,
			isSavingSettings,
			translate,
			jetpackVersionSupportsLazyImages,
			siteAcceleratorSupported,
			photonModuleActive,
			assetCdnModuleActive,
			togglingSiteAccelerator,
		} = this.props;
		const isRequestingOrSaving = isRequestingSettings || isSavingSettings;
		const cdnStatus = photonModuleActive || assetCdnModuleActive;

		return (
			<div className="site-settings__module-settings site-settings__speed-up-site-settings">
				<Card>
					<FormFieldset className="site-settings__formfieldset">
						<SupportInfo
							text={ translate(
								"Jetpack's global Content Delivery Network (CDN) optimizes " +
									'files and images so your visitors enjoy ' +
									'the fastest experience regardless of device or location.'
							) }
							link="http://jetpack.com/support/site-accelerator/"
						/>
						<CompactFormToggle
							checked={ !! cdnStatus }
							disabled={
								isRequestingOrSaving ||
								photonModuleUnavailable ||
								! siteAcceleratorSupported ||
								togglingSiteAccelerator
							}
							onChange={ this.handleCdnChange }
							toggling={ togglingSiteAccelerator }
						>
							{ translate( 'Enable site accelerator' ) }
						</CompactFormToggle>
						<div className="site-settings__child-settings">
							<JetpackModuleToggle
								siteId={ selectedSiteId }
								moduleSlug="photon"
								label={ translate( 'Speed up image load times' ) }
								description={ translate(
									'Jetpack will optimize your images and serve them from the server ' +
										'location nearest to your visitors.'
								) }
								disabled={ isRequestingOrSaving || photonModuleUnavailable }
							/>
							<JetpackModuleToggle
								siteId={ selectedSiteId }
								moduleSlug="photon-cdn"
								label={ translate( 'Speed up static file load times' ) }
								description={ translate(
									'All static files (CSS and JavaScript) for WordPress, WooCommerce, and Jetpack ' +
										'will be served via our global CDN.'
								) }
								disabled={ isRequestingOrSaving || ! siteAcceleratorSupported }
							/>
						</div>
					</FormFieldset>

					{ jetpackVersionSupportsLazyImages && (
						<FormFieldset className="site-settings__formfieldset has-divider is-top-only">
							<SupportInfo
								text={ translate(
									"Delays the loading of images until they are visible in the visitor's browser."
								) }
								link="https://jetpack.com/support/lazy-images/"
							/>
							<JetpackModuleToggle
								siteId={ selectedSiteId }
								moduleSlug="lazy-images"
								label={ translate( 'Lazy load images' ) }
								description={ translate(
									"Improve your site's speed by only loading images visible on the screen. New images will " +
										'load just before they scroll into view. This prevents viewers from having to download ' +
										"all the images on a page all at once, even ones they can't see."
								) }
								disabled={ isRequestingOrSaving }
							/>
						</FormFieldset>
					) }
				</Card>
			</div>
		);
	}
}

export default connect(
	state => {
		const selectedSiteId = getSelectedSiteId( state );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
			state,
			selectedSiteId,
			'photon'
		);
		const photonModuleActive = isJetpackModuleActive( state, selectedSiteId, 'photon' );
		const assetCdnModuleActive = isJetpackModuleActive( state, selectedSiteId, 'photon-cdn' );
		const isPhotonActivating = isActivatingJetpackModule( state, selectedSiteId, 'photon' );
		const isAssetCdnActivating = isActivatingJetpackModule( state, selectedSiteId, 'photon-cdn' );
		const isPhotonDeactivating = isDeactivatingJetpackModule( state, selectedSiteId, 'photon' );
		const isAssetCdnDeactivating = isDeactivatingJetpackModule(
			state,
			selectedSiteId,
			'photon-cdn'
		);

		let togglingSiteAccelerator;
		// First Photon activating.
		if ( isPhotonActivating ) {
			if ( assetCdnModuleActive ) {
				togglingSiteAccelerator = false;
			} else {
				togglingSiteAccelerator = true;
			}
			// Then Asset CDN activating.
		} else if ( isAssetCdnActivating ) {
			if ( photonModuleActive ) {
				togglingSiteAccelerator = false;
			} else {
				togglingSiteAccelerator = true;
			}
			// Then Photon deactivating.
		} else if ( isPhotonDeactivating ) {
			if ( assetCdnModuleActive ) {
				togglingSiteAccelerator = false;
			} else {
				togglingSiteAccelerator = true;
			}
			// Then Asset CDN deactivating.
		} else if ( isAssetCdnDeactivating ) {
			if ( photonModuleActive ) {
				togglingSiteAccelerator = false;
			} else {
				togglingSiteAccelerator = true;
			}
		} else {
			togglingSiteAccelerator = false;
		}

		return {
			photonModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
			selectedSiteId,
			siteSlug: getSiteSlug( state, selectedSiteId ),
			photonModuleActive,
			assetCdnModuleActive,
			togglingSiteAccelerator,
		};
	},
	{
		activateModule,
		deactivateModule,
	}
)( localize( SpeedUpSiteSettings ) );
