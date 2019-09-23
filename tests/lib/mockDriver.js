class MockDriver {

    /**
     * Serialize
     *
     * @param data
     */
    serialize(data){
        return (JSON.stringify(data)) + '-MOCKED'
    }

    /**
     * Unserialize
     *  if cannot unserialize return data untouched
     *
     * @param data
     */
    unSerialize(data) {
        return data.split('-MOCKED')[0]
    }

}

module.exports = MockDriver;
