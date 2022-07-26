import { useActions, useActivity } from "@stackflow/react";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import React, { useMemo } from "react";

import * as css from "./AppBar.css";
import * as appScreenCss from "./AppScreen.css";
import { IconBack, IconClose } from "./assets";
import {
  compactMap,
  useActiveActivities,
  useMaxWidth,
  useTopActiveActivity,
} from "./utils";

interface AppBarProps {
  theme?: "android" | "cupertino";
  title?: React.ReactNode;
  appendLeft?: () => React.ReactNode;
  appendRight?: () => React.ReactNode;
  closeButtonLocation?: "left" | "right";
  customBackButton?: () => React.ReactNode;
  customCloseButton?: () => React.ReactNode;
  onClose?: () => void;
  border?: boolean;
  iconColor?: string;
  textColor?: string;
  borderColor?: string;
  height?: string;
}
const AppBar: React.FC<AppBarProps> = ({
  theme,
  title,
  appendLeft,
  appendRight,
  closeButtonLocation = "left",
  customBackButton,
  customCloseButton,
  onClose,
  border = true,
  iconColor,
  textColor,
  borderColor,
  height,
}) => {
  const actions = useActions();

  const currentActivity = useActivity();
  const activeActivities = useActiveActivities();
  const topActiveActivity = useTopActiveActivity();

  const isTopActive = useMemo(
    () => topActiveActivity?.id === currentActivity.id,
    [topActiveActivity, currentActivity],
  );

  const isRoot = activeActivities[0]?.id === currentActivity.id;
  const isAfterRoot = activeActivities[1]?.id === currentActivity.id;
  const isPushedByReplace = currentActivity.pushedBy.name === "Replaced";

  const isCloseButtonVisible = isRoot || (isAfterRoot && isPushedByReplace);

  const {
    outerRef: appBarRef,
    innerRef: centerRef,
    maxWidth,
  } = useMaxWidth({
    enable: theme === "cupertino",
  });

  const onBack = () => {
    actions.pop();
  };

  const backButton = !isCloseButtonVisible && (
    <button type="button" className={css.backButton} onClick={onBack}>
      {customBackButton ? customBackButton() : <IconBack />}
    </button>
  );

  const closeButton = onClose && isCloseButtonVisible && (
    <button type="button" className={css.closeButton} onClick={onClose}>
      {customCloseButton ? customCloseButton() : <IconClose />}
    </button>
  );

  const hasLeft = !!(
    (closeButtonLocation === "left" && closeButton) ||
    backButton ||
    appendLeft
  );

  return (
    <div
      ref={appBarRef}
      className={css.appBar({
        border,
        isTopActive,
      })}
      style={assignInlineVars(
        compactMap({
          [appScreenCss.vars.appBar.iconColor]: iconColor,
          [appScreenCss.vars.appBar.textColor]: textColor,
          [appScreenCss.vars.appBar.borderColor]: borderColor,
          [appScreenCss.vars.appBar.height]: height,
          [appScreenCss.localVars.appBar.center.mainWidth]: `${maxWidth}px`,
        }),
      )}
    >
      <div className={css.left}>
        {closeButtonLocation === "left" && closeButton}
        {backButton}
        {appendLeft?.()}
      </div>
      <div ref={centerRef} className={css.center}>
        <div
          className={css.centerMain({
            hasLeft,
          })}
        >
          {typeof title === "string" ? (
            <div className={css.centerText}>{title}</div>
          ) : (
            title
          )}
        </div>
      </div>
      <div className={css.right}>
        {appendRight?.()}
        {closeButtonLocation === "right" && closeButton}
      </div>
    </div>
  );
};

export default AppBar;