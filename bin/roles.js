const nodeAbac = require('node-abac');

const accessPolicy = {
    attributes: {
        user: {
            role: 'Is A Site Owner',
            dateJoined: 'Member for over 1 year',
            reviews: 'Has written at least 12 reviews'
        }
    },
    rules: {
        'fullAccess': {
            attributes: {
                'user.role': {
                    comparison_type: 'string',
                    comparison: 'isStrictlyEqual',
                    value: 'owner'
                }
            }
        },
        'canModerateReviews': {
            attributes: {
                'user.dateJoined': {
                    comparison_type: "datetime",
                    comparison: "isLessRecentThan",
                    value: "-1Y"
                },
                'user.reviews.length': {
                    comparison_type: 'numeric',
                    comparison: 'isGreaterThanEqualTo',
                    value: '12'
                }
            }
        }
    }
}

const accessControl = new nodeAbac(accessPolicy, true);

module.exports = accessControl;