import React from 'react';
import { useI18n } from '../i18n';
import { shortcutGroups } from './shortcutGroups';

interface ZoneTocProps {
  showLocal?: boolean;
  selectedThemeAnchors?: string[];
}

const ZoneToc: React.FC<ZoneTocProps> = ({ showLocal = false, selectedThemeAnchors = [] }) => {
  const { t, categoryName } = useI18n();
  const visibleGroups = selectedThemeAnchors.length > 0
    ? shortcutGroups.filter((group) => selectedThemeAnchors.includes(group.anchor))
    : shortcutGroups;

  return (
    <nav className="toc-card" aria-label={t('whatAreYouLookingFor')}>
      <p className="toc-heading">{t('whatAreYouLookingFor')}</p>
      <ul className="toc-list">
        {showLocal && (
          <li>
            <a
              href="#lahellasi"
              className="toc-chip zone-local"
              title={`${t('goToSection')} ${t('nearYou')}`}
            >
              <span className="toc-dot" aria-hidden="true">📍</span>
              {t('nearYou')}
            </a>
          </li>
        )}
        {visibleGroups.map((group) => (
          <li key={group.anchor}>
            <a
              href={`#${group.anchor}`}
              className={`toc-chip ${group.zone}`}
              title={`${t('goToSection')} ${categoryName(group.name)}`}
            >
              <span className="toc-dot" aria-hidden="true">{group.icon}</span>
              {categoryName(group.name)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ZoneToc;
