/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { WechatPaymentBox } from '../wechat-payment-box';
import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_FREE,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

jest.mock( 'lib/cart-values', () => ( {
	isPaymentMethodEnabled: jest.fn( false ),
	paymentMethodName: jest.fn( false ),
	cartItems: {
		hasRenewableSubscription: jest.fn( false ),
		hasRenewalItem: jest.fn( false ),
	},
} ) );

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

const defaultProps = {
	cart: { total_cost: 100, products: [] },
	translate: x => x,
	countriesList: [
		{
			code: 'US',
			name: 'United States',
		},
		{
			code: 'CN',
			name: 'China',
		},
	],
	paymentType: 'default',
	transaction: {},
	redirectTo: x => x,
	selectedSite: { slug: 'example.com' },
	showErrorNotice: x => x,
	showInfoNotice: x => x,
	createRedirect: x => x,
	pending: false,
	failure: false,
	reset: x => x,
	redirectUrl: null,
	orderId: null,
	isMobile: false,
};

describe( 'WechatPaymentBox', () => {
	test( 'has correct components and css', () => {
		const wrapper = shallow( <WechatPaymentBox { ...defaultProps } /> );

		expect( wrapper.find( '.checkout__payment-box-section' ) ).toHaveLength( 1 );
		expect( wrapper.find( '.checkout__payment-box-actions' ) ).toHaveLength( 1 );
		expect( wrapper.find( '[name="name"]' ) ).toHaveLength( 1 );
		expect( wrapper.find( 'Localized(TermsOfService)' ) ).toHaveLength( 1 );
		expect( wrapper.find( 'Connect(Localized(CartCoupon))' ) ).toHaveLength( 1 );
		expect( wrapper.find( 'Localized(CartToggle)' ) ).toHaveLength( 1 );
	} );

	const businessPlans = [ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ];

	businessPlans.forEach( product_slug => {
		test( 'should render PaymentChatButton if any WP.com business plan is in the cart', () => {
			const props = {
				...defaultProps,
				presaleChatAvailable: true,
				cart: {
					products: [ { product_slug } ],
				},
			};
			const wrapper = shallow( <WechatPaymentBox { ...props } /> );

			expect( wrapper.find( 'Connect(Localized(PaymentChatButton))' ) ).toHaveLength( 1 );
		} );
	} );

	businessPlans.forEach( product_slug => {
		test( 'should not render PaymentChatButton if presaleChatAvailable is false', () => {
			const props = {
				...defaultProps,
				presaleChatAvailable: false,
				cart: {
					products: [ { product_slug } ],
				},
			};
			const wrapper = shallow( <WechatPaymentBox { ...props } /> );
			expect( wrapper.find( 'Connect(Localized(PaymentChatButton))' ) ).toHaveLength( 0 );
		} );
	} );

	const otherPlans = [
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_BLOGGER,
		PLAN_BLOGGER_2_YEARS,
		PLAN_FREE,
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	];

	otherPlans.forEach( product_slug => {
		test( 'should not render PaymentChatButton if only non-business plan products are in the cart', () => {
			const props = {
				...defaultProps,
				cart: {
					products: [ { product_slug } ],
				},
			};
			const wrapper = shallow( <WechatPaymentBox { ...props } /> );
			expect( wrapper.find( 'Connect(Localized(PaymentChatButton))' ) ).toHaveLength( 0 );
		} );
	} );

	describe( '#componentDidUpdate', () => {
		test( 'redirects on mobile', () => {
			// https://github.com/facebook/jest/issues/890#issuecomment-295939071
			window.location.assign = jest.fn();

			const redirectUrl = 'https://redirect';

			const instance = shallow(
				<WechatPaymentBox { ...defaultProps } redirectUrl={ redirectUrl } isMobile={ true } />
			).instance();

			instance.componentDidUpdate( Object.assign( {}, defaultProps, { pending: true } ) );

			expect( window.location.assign ).toHaveBeenCalledWith( redirectUrl );
		} );

		test( 'does not redirect on desktop', () => {
			window.location.assign = jest.fn();

			const redirectUrl = 'https://redirect';

			const instance = shallow(
				<WechatPaymentBox { ...defaultProps } redirectUrl={ redirectUrl } isMobile={ false } />
			).instance();

			instance.componentDidUpdate( Object.assign( {}, defaultProps, { pending: true } ) );

			expect( window.location.assign ).not.toHaveBeenCalledWith( redirectUrl );
		} );

		test( 'displays a qr code on desktop', () => {
			window.location.assign = jest.fn();

			const redirectUrl = 'https://redirect';

			const wrapper = shallow(
				<WechatPaymentBox { ...defaultProps } redirectUrl={ redirectUrl } isMobile={ false } />
			);

			expect( wrapper.find( 'Connect(Localized(WechatPaymentQRCode))' ) ).toHaveLength( 1 );
		} );
	} );
} );
