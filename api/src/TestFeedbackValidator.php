<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use DateTimeImmutable;
use Throwable;

final class TestFeedbackValidator
{
    private const FEATURE_KEYS = [
        'weather',
        'assistant',
        'internetSearch',
        'scamAlerts',
        'nearby',
        'favorites',
        'categorySearch',
        'namedays',
        'localNews',
    ];

    /** @return array{id: string, form_version: string, response: array<string, mixed>} */
    public static function validate(array $data): array
    {
        $allowed = [
            'id', 'formVersion', 'createdAt', 'deviceTypes', 'useMode', 'webExperience',
            'purposeClear', 'headerClarity', 'firstImpression', 'pageFeelings', 'foundServices',
            'searchedFor', 'missingService', 'categoryClarity', 'unclearCategory',
            'municipalityCorrect', 'localServicesUseful', 'seniorPageStatus', 'missingLocalLink',
            'localNewsUseful', 'featureRatings', 'missingFeature', 'textSize', 'contrastClarity',
            'mobileEase', 'difficultPart', 'tourViewed', 'tourHelpful', 'tourFeedback',
            'usefulnessRating', 'easeRating', 'recommend', 'mostImportantFix', 'bestThing',
            'website',
        ];
        $required = [
            'id', 'formVersion', 'createdAt', 'deviceTypes', 'useMode', 'webExperience',
            'purposeClear', 'firstImpression', 'pageFeelings', 'foundServices', 'searchedFor',
            'missingService', 'categoryClarity', 'unclearCategory', 'municipalityCorrect',
            'localServicesUseful', 'missingLocalLink', 'localNewsUseful', 'featureRatings',
            'missingFeature', 'textSize', 'contrastClarity', 'mobileEase', 'difficultPart',
            'tourViewed', 'tourHelpful', 'tourFeedback', 'usefulnessRating', 'easeRating',
            'recommend', 'mostImportantFix', 'bestThing',
        ];
        Validator::shape($data, $allowed, $required);
        Validator::honeypotIsEmpty($data);

        $id = Validator::uuid($data, 'id');
        $formVersion = Validator::enum($data, 'formVersion', ['2026-06', '2026-08-release-candidate']);
        self::validateCreatedAt(Validator::string($data, 'createdAt', 20, 40));

        if ($formVersion === '2026-08-release-candidate') {
            Validator::shape($data, $allowed, [...$required, 'headerClarity', 'seniorPageStatus']);
        } elseif (array_key_exists('headerClarity', $data) || array_key_exists('seniorPageStatus', $data)) {
            throw Validator::invalidField(array_key_exists('headerClarity', $data) ? 'headerClarity' : 'seniorPageStatus');
        }

        $response = [
            'createdAt' => Validator::string($data, 'createdAt', 20, 40),
            'deviceTypes' => Validator::enumList($data, 'deviceTypes', ['phone', 'tablet', 'computer'], 1, 3),
            'useMode' => Validator::enum($data, 'useMode', ['', 'self', 'withSomeone', 'guidance']),
            'webExperience' => Validator::enum($data, 'webExperience', ['', 'often', 'sometimes', 'needsHelp', 'observer']),
            'purposeClear' => Validator::enum($data, 'purposeClear', ['', 'yes', 'partly', 'no']),
            'firstImpression' => Validator::string($data, 'firstImpression', 0, 1200),
            'pageFeelings' => Validator::enumList(
                $data,
                'pageFeelings',
                ['clear', 'calm', 'useful', 'tooFull', 'confusing', 'pleasant'],
                0,
                8,
            ),
            'foundServices' => Validator::enum($data, 'foundServices', ['yes', 'partly', 'no']),
            'searchedFor' => Validator::string($data, 'searchedFor', 0, 900),
            'missingService' => Validator::string($data, 'missingService', 0, 900),
            'categoryClarity' => Validator::enum($data, 'categoryClarity', ['', 'yes', 'partly', 'no']),
            'unclearCategory' => Validator::string($data, 'unclearCategory', 0, 900),
            'municipalityCorrect' => Validator::enum($data, 'municipalityCorrect', ['', 'yes', 'no', 'notSeen']),
            'localServicesUseful' => Validator::enum($data, 'localServicesUseful', ['', 'yes', 'partly', 'no', 'notUsed']),
            'missingLocalLink' => Validator::string($data, 'missingLocalLink', 0, 900),
            'localNewsUseful' => Validator::enum($data, 'localNewsUseful', ['', 'yes', 'partly', 'no', 'notSeen']),
            'featureRatings' => self::featureRatings($data),
            'missingFeature' => Validator::string($data, 'missingFeature', 0, 900),
            'textSize' => Validator::enum($data, 'textSize', ['', 'good', 'tooSmall', 'tooLarge', 'changed']),
            'contrastClarity' => Validator::enum($data, 'contrastClarity', ['', 'yes', 'partly', 'no']),
            'mobileEase' => Validator::enum($data, 'mobileEase', ['', 'yes', 'partly', 'no', 'notTested']),
            'difficultPart' => Validator::string($data, 'difficultPart', 0, 1200),
            'tourViewed' => Validator::enum($data, 'tourViewed', ['', 'yes', 'partly', 'no']),
            'tourHelpful' => Validator::enum($data, 'tourHelpful', ['', 'yes', 'partly', 'no', 'notViewed']),
            'tourFeedback' => Validator::string($data, 'tourFeedback', 0, 900),
            'usefulnessRating' => Validator::integer($data, 'usefulnessRating', 1, 5),
            'easeRating' => Validator::integer($data, 'easeRating', 0, 5),
            'recommend' => Validator::enum($data, 'recommend', ['', 'yes', 'maybe', 'no']),
            'mostImportantFix' => Validator::string($data, 'mostImportantFix', 3, 1200),
            'bestThing' => Validator::string($data, 'bestThing', 0, 900),
        ];

        if ($formVersion === '2026-08-release-candidate') {
            $response['headerClarity'] = Validator::enum($data, 'headerClarity', ['', 'yes', 'partly', 'no']);
            $response['seniorPageStatus'] = Validator::enum(
                $data,
                'seniorPageStatus',
                ['', 'opened', 'broken', 'notFound', 'notTested'],
            );
        }

        return ['id' => $id, 'form_version' => $formVersion, 'response' => $response];
    }

    /** @param array<string, mixed> $data @return array<string, int> */
    private static function featureRatings(array $data): array
    {
        $ratings = Validator::object($data, 'featureRatings');
        Validator::shape($ratings, self::FEATURE_KEYS);
        $validated = [];
        foreach ($ratings as $key => $value) {
            if (!is_int($value) || $value < 1 || $value > 5) {
                throw Validator::invalidField('featureRatings.' . $key);
            }
            $validated[$key] = $value;
        }
        return $validated;
    }

    private static function validateCreatedAt(string $value): void
    {
        if (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/D', $value) !== 1) {
            throw Validator::invalidField('createdAt');
        }
        try {
            new DateTimeImmutable($value);
        } catch (Throwable) {
            throw Validator::invalidField('createdAt');
        }
    }
}
