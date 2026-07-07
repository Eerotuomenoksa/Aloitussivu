import React from 'react';
import { useI18n } from '../i18n';
import { shortcutGroups } from './shortcutGroups';

const ZoneToc: React.FC<{ showLocal?: boolean }> = ({ showLocal = false }) => {
  const { t, categoryName } = useI18n();

  return (
    <nav className="toc-card" aria-label={t('whatAreYouLookingFor')}>
      <p className="toc-heading">{t('whatAreYouLookingFor')}</p>
      <ul className="toc-list">
        {showLocal && (
          <li>
            <a
              href="#lahellasi"
              className="toc-chip zone-local"
              title={`Siirry kohtaan ${t('nearYou')}`}
            >
              <span className="toc-dot" aria-hidden="true">📍</span>
              {t('nearYou')}
            </a>
          </li>
        )}
        {shortcutGroups.map((group) => (
          <li key={group.anchor}>
            <a
              href={`#${group.anchor}`}
              className={`toc-chip ${group.zone}`}
              title={`Siirry kohtaan ${categoryName(group.name)}`}
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
