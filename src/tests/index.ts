import first from './tests';
import integrator from './integrator';

// @ts-ignore
describe('Testing node Laravel Encryptor', function() {
    // @ts-ignore
    describe('Test Encryptor Class', first.bind(this));
    // @ts-ignore
    describe('Test integration with express cookie', integrator.bind(this));
});
