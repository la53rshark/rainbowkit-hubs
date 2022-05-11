import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, AcceptButton } from "../input/Button";
import styles from "./AvatarSettingsContent.scss";
import { TextInputField } from "../input/TextInputField";
import { Column } from "../layout/Column";
import { FormattedMessage } from "react-intl";
import { useMetaMask } from "metamask-react";
import ENS, { getEnsAddress } from "@ensdomains/ensjs";
import namehash from "@ensdomains/eth-ens-namehash";
import { ConnectButton } from '@rainbow-me/rainbowkit';


export function AvatarSettingsContent({
  displayName,
  displayNameInputRef,
  disableDisplayNameInput,
  onChangeDisplayName,
  onChangeDisplayNameEns,
  avatarPreview,
  displayNamePattern,
  onChangeAvatar,
  ...rest
}) {
  const [ensName, ensNameSet] = useState("");
  const { status, connect, account } = useMetaMask();

  async function pingEnsThings() {
    const ens = new ENS({ provider: window.ethereum, ensAddress: getEnsAddress("1") });
    const name = await ens.getName(account);
    onChangeDisplayNameEns(name.name);
    return ensNameSet(name.name);
  }

  return (
    <Column as="form" className={styles.content} {...rest}>
      {status === "notConnected" && (
        <>
          <Button onClick={connect}>Connect to MetaMask</Button>
          <ConnectButton />
        </>
      )}
      {status === "connecting" && <div>Connecting...</div>}
      {status === "connected" && <div>Connected account: {account}</div>}
      {status === "connected" && (
        <>
          <Button onClick={() => pingEnsThings(ensName)}>Set ENS name.</Button>
        </>
      )}
      <>
        {" "}
        <TextInputField
          disabled={disableDisplayNameInput}
          label={<FormattedMessage id="avatar-settings-content.display-name-label" defaultMessage="Display Name" />}
          value={displayName}
          pattern={displayNamePattern}
          spellCheck="false"
          required
          onChange={onChangeDisplayName}
          description={
            <FormattedMessage
              id="avatar-settings-content.display-name-description"
              defaultMessage="Alphanumerics, hyphens, underscores, and tildes. At least 3 characters, no more than 32"
            />
          }
          ref={displayNameInputRef}
        />
      </>
      <div className={styles.avatarPreviewContainer}>
        {avatarPreview || <div />}
        <Button type="button" preset="basic" onClick={onChangeAvatar}>
          <FormattedMessage id="avatar-settings-content.change-avatar-button" defaultMessage="Change Avatar" />
        </Button>
      </div>
      <AcceptButton preset="accept" type="submit" />
    </Column>
  );
}

AvatarSettingsContent.propTypes = {
  className: PropTypes.string,
  displayName: PropTypes.string,
  displayNameInputRef: PropTypes.func,
  disableDisplayNameInput: PropTypes.bool,
  displayNamePattern: PropTypes.string,
  onChangeDisplayName: PropTypes.func,
  onChangeDisplayNameEns: PropTypes.func,
  avatarPreview: PropTypes.node,
  onChangeAvatar: PropTypes.func
};
