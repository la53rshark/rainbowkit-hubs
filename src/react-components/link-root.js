import React, { Component } from "react";
import PropTypes from "prop-types";
import { IntlProvider, FormattedMessage, addLocaleData } from "react-intl";
import en from "react-intl/locale-data/en";

import { lang, messages } from "../utils/i18n";
import classNames from "classnames";
import styles from "../assets/stylesheets/link.scss";

const MAX_DIGITS = 4;

addLocaleData([...en]);

class LinkRoot extends Component {
  static propTypes = {
    intl: PropTypes.object,
    store: PropTypes.object,
    linkChannel: PropTypes.object
  };

  state = {
    enteredDigits: "",
    failedAtLeastOnce: false
  };

  addDigit = digit => {
    if (this.state.enteredDigits.length >= MAX_DIGITS) return;
    const newDigits = `${this.state.enteredDigits}${digit}`;

    if (newDigits.length === MAX_DIGITS) {
      this.attemptLink(newDigits);
    }

    this.setState({ enteredDigits: newDigits });
  };

  removeDigit = () => {
    if (this.state.enteredDigits.length === 0) return;
    this.setState({ enteredDigits: this.state.enteredDigits.substring(0, -1) });
  };

  attemptLink = code => {
    this.props.linkChannel
      .attemptLink(code)
      .then(response => {
        // If there is a profile from the linked device, copy it over if we don't have one yet.
        if (response.profile) {
          const { hasChangedName } = this.props.store.state.activity;

          if (!hasChangedName) {
            this.props.store.update({ activity: { hasChangedName: true }, profile: response.profile });
          }
        }

        if (response.path) {
          window.location.href = response.path;
        }
      })
      .catch(e => {
        console.error(e);
        this.setState({ failedAtLeastOnce: true, enteredDigits: "" });
      });
  };

  render() {
    return (
      <IntlProvider locale={lang} messages={messages}>
        <div className={styles.link}>
          <div className={styles.linkContents}>
            {this.state.enteredDigits.length === MAX_DIGITS && (
              <div className={classNames("loading-panel", styles.codeLoadingPanel)}>
                <div className="loader-wrap">
                  <div className="loader">
                    <div className="loader-center" />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.header}>
              <FormattedMessage id={this.state.failedAtLeastOnce ? "link.try_again" : "link.link_page_header"} />
            </div>

            <div className={styles.enteredDigits}>
              <input
                className={styles.digitInput}
                type="number"
                value={this.state.enteredDigits}
                onChange={ev => {
                  this.setState({ enteredDigits: ev.target.value });
                }}
                placeholder="- - - -"
              />
            </div>

            <div className={styles.keypad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d, i) => (
                <button
                  disabled={this.state.enteredDigits.length === MAX_DIGITS}
                  key={`digit_${i}`}
                  className={styles.keypadButton}
                  onClick={() => this.addDigit(d)}
                >
                  {d}
                </button>
              ))}
              <button
                disabled={this.state.enteredDigits.length === MAX_DIGITS}
                className={classNames(styles.keypadButton, styles.keypadZeroButton)}
                onClick={() => this.addDigit(0)}
              >
                0
              </button>
              <button
                disabled={this.state.enteredDigits.length === 0 || this.state.enteredDigits.length === MAX_DIGITS}
                className={classNames(styles.keypadButton, styles.keypadBackspace)}
                onClick={() => this.removeDigit()}
              >
                ⌫
              </button>
            </div>

            <div className={styles.footer}>
              <span>
                <FormattedMessage id="link.dont_have_a_code" />
              </span>{" "}
              <span>
                <a href="/">
                  <FormattedMessage id="link.create_a_room" />
                </a>
              </span>
            </div>

            <img className={styles.footerImage} src="../assets/images/logo.svg" />
          </div>
        </div>
      </IntlProvider>
    );
  }
}

export default LinkRoot;
