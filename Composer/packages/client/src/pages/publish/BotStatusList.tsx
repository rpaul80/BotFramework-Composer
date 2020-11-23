// Copyright (c) Microsoft Corporation.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import moment from 'moment';
import formatMessage from 'format-message';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import React, { useState } from 'react';
import { Fragment } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { PublishTarget } from '@bfc/shared';
import {
  CheckboxVisibility,
  DetailsList,
  IColumn,
  IDetailsColumnStyleProps,
  IDetailsColumnStyles,
} from 'office-ui-fabric-react/lib/DetailsList';
import { IStyleFunctionOrObject } from 'office-ui-fabric-react/lib/Utilities';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { navigateTo } from '../../utils/navigation';

import { IStatus, PublishStatusList } from './PublishStatusList';
import { detailList, listRoot, tableView } from './styles';

// Licensed under the MIT License.
export type IBotStatus = {
  id: string;
  name: string;
  publishTargets?: PublishTarget[];
  publishTarget?: string;
  time?: string;
  status?: number;
  message?: string;
  comment?: string;
};
export type IBotStatusListProps = {
  projectId: string;
  items: IBotStatus[];
  botPublishHistoryList: { projectId: string; publishHistory: IStatus[] }[];
  updateItems: (items: IBotStatus[]) => void;
  updatePublishHistory: (items: IStatus[], item: IBotStatus) => void;
  updateSelectedBots: (items: IBotStatus[]) => void;
  changePublishTarget: (PublishTarget: string, item: IBotStatus) => void;
  onLogClick: (item: IStatus) => void;
  onRollbackClick: (selectedVersion: IStatus, item: IBotStatus) => void;
};

export const BotStatusList: React.FC<IBotStatusListProps> = (props) => {
  const {
    projectId,
    items,
    botPublishHistoryList,
    updateItems,
    updatePublishHistory,
    changePublishTarget,
    updateSelectedBots,
    onLogClick,
    onRollbackClick,
  } = props;
  const [selectedBots, setSelectedBots] = useState<IBotStatus[]>([]);
  const [showHistoryBots, setShowHistoryBots] = useState<string[]>([]);

  const [currentSort, setSort] = useState({ key: 'Bot', descending: true });
  const sortByName = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    if (column.isSorted) {
      column.isSortedDescending = !column.isSortedDescending;
      const newItems: IBotStatus[] = items.reverse();
      updateItems(newItems);
    }
  };
  const changeSelected = (item: IBotStatus, isChecked?: boolean) => {
    let newSelectedBots: IBotStatus[];
    if (isChecked) {
      newSelectedBots = selectedBots.concat(item);
    } else {
      newSelectedBots = selectedBots.filter((bot) => bot.id !== item.id);
    }
    setSelectedBots(newSelectedBots);
    updateSelectedBots(newSelectedBots);
  };

  const publishTargetOptions = (item: IBotStatus): IDropdownOption[] => {
    const options: IDropdownOption[] = [];
    item.publishTargets &&
      item.publishTargets.forEach((target) => {
        options.push({
          key: target.name,
          text: target.name,
        });
      });
    options.push({
      key: 'manageProfiles',
      text: formatMessage('Manage profiles'),
      data: { style: { color: '#0078D4' } },
    });
    return options;
  };
  const onRenderOption = (option?: IDropdownOption): JSX.Element | null => {
    if (!option) return null;
    return <div style={option.data && option.data.style}>{option.text}</div>;
  };
  const handleChangePublishTarget = (item: IBotStatus, option?: IDropdownOption): void => {
    if (option) {
      if (option.key === 'manageProfiles') {
        navigateTo(`/bot/${projectId}/botProjectsSettings/${item.id === projectId ? 'root' : item.id}`);
        return;
      }
      changePublishTarget(option.text, item);
    }
  };
  const changeShowHistoryBots = (item: IBotStatus) => {
    let newShowHistoryBots: string[];
    if (showHistoryBots.includes(item.id)) {
      newShowHistoryBots = showHistoryBots.filter((id) => id !== item.id);
    } else {
      newShowHistoryBots = showHistoryBots.concat(item.id);
    }
    setShowHistoryBots(newShowHistoryBots);
  };
  const colomnStyle: IStyleFunctionOrObject<IDetailsColumnStyleProps, IDetailsColumnStyles> = {
    root: { display: 'flex', alignItems: 'center' },
  };
  const columns = [
    {
      key: 'Bot',
      name: formatMessage('name'),
      className: 'publishname',
      fieldName: 'name',
      minWidth: 114,
      maxWidth: 134,
      isRowHeader: true,
      isResizable: true,
      onColumnClick: sortByName,
      data: 'string',
      onRender: (item: IBotStatus) => {
        return <Checkbox label={item.name} onChange={(_, isChecked) => changeSelected(item, isChecked)} />;
      },
      isPadded: true,
    },
    {
      key: 'PublishTarget',
      name: formatMessage('Publish target'),
      className: 'publishtarget',
      fieldName: 'target',
      minWidth: 114,
      maxWidth: 134,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: IBotStatus) => {
        return (
          <Dropdown
            defaultSelectedKey={item.publishTarget}
            options={publishTargetOptions(item)}
            placeholder={formatMessage('Select a publish target')}
            styles={{ root: { width: '134px' } }}
            onChange={(_, option?: IDropdownOption) => handleChangePublishTarget(item, option)}
            onRenderOption={onRenderOption}
          />
        );
      },
      isPadded: true,
    },
    {
      key: 'PublishDate',
      name: formatMessage('Date'),
      className: 'publishdate',
      fieldName: 'date',
      minWidth: 114,
      maxWidth: 134,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: IBotStatus) => {
        return <span>{moment(item.time).format('MM-DD-YYYY')}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishStatus',
      name: formatMessage('Status'),
      className: 'publishstatus',
      fieldName: 'status',
      minWidth: 114,
      maxWidth: 134,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: IBotStatus) => {
        if (item.status === 200) {
          return <Icon iconName="Accept" style={{ color: 'green', fontWeight: 600 }} />;
        } else if (item.status === 202) {
          return (
            <div style={{ display: 'flex' }}>
              <Spinner size={SpinnerSize.small} />
            </div>
          );
        } else {
          return <Icon iconName="Cancel" style={{ color: 'red', fontWeight: 600 }} />;
        }
      },
      isPadded: true,
    },
    {
      key: 'PublishMessage',
      name: formatMessage('Message'),
      className: 'publishmessage',
      fieldName: 'message',
      minWidth: 150,
      maxWidth: 300,
      isRowHeader: true,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: IBotStatus) => {
        return <span>{item.message}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishComment',
      name: formatMessage('Comment'),
      className: 'comment',
      fieldName: 'comment',
      minWidth: 150,
      maxWidth: 300,
      isRowHeader: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      styles: colomnStyle,
      onRender: (item: IBotStatus) => {
        return <span>{item.comment}</span>;
      },
      isPadded: true,
    },
    {
      key: 'ShowPublishHistory',
      name: formatMessage(''),
      className: 'showhistory',
      fieldName: 'showHistory',
      minWidth: 150,
      maxWidth: 300,
      isRowHeader: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      styles: colomnStyle,
      onRender: (item: IBotStatus) => {
        return (
          <IconButton
            iconProps={{ iconName: showHistoryBots.includes(item.id) ? 'ChevronDown' : 'ChevronRight' }}
            onClick={() => changeShowHistoryBots(item)}
          />
        );
      },
      isPadded: true,
    },
  ];
  const onRenderRow = (props, defaultRender) => {
    const { item }: { item: IBotStatus } = props;
    const publishStatusList: IStatus[] = item.publishTarget
      ? botPublishHistoryList.find((list) => list.projectId === item.id)?.publishHistory[item.publishTarget] || []
      : [];
    const handleRollbackClick = (selectedVersion) => {
      onRollbackClick(selectedVersion, item);
    };
    const hanldeUpdatePublishHistory = (publishHistories) => {
      updatePublishHistory(publishHistories, item);
    };
    return (
      <Fragment>
        {defaultRender(props)}
        <div css={{ display: showHistoryBots.includes(item.id) ? 'block' : 'none' }}>
          <div css={{ fontSize: '14px', lineHeight: '20px', color: '#323130', fontWeight: 'bold' }}>
            Publish history
          </div>
          {publishStatusList.length === 0 ? (
            <div style={{ marginLeft: '50px', fontSize: 'smaller', marginTop: '20px' }}>No publish history</div>
          ) : (
            <PublishStatusList
              items={publishStatusList}
              updateItems={hanldeUpdatePublishHistory}
              onLogClick={onLogClick}
              onRollbackClick={handleRollbackClick}
            />
          )}
        </div>
      </Fragment>
    );
  };
  return (
    <div css={listRoot} data-testid={'publish-status-list'}>
      <div css={tableView}>
        <DetailsList
          isHeaderVisible
          checkboxVisibility={CheckboxVisibility.hidden}
          columns={columns.map((col) => ({
            ...col,
            isSorted: col.key === currentSort.key,
            isSortedDescending: currentSort.descending,
          }))}
          css={detailList}
          items={items}
          onColumnHeaderClick={(_, clickedCol) => {
            if (!clickedCol) return;
            if (clickedCol.key === currentSort.key) {
              clickedCol.isSortedDescending = !currentSort.descending;
              setSort({ key: clickedCol.key, descending: !currentSort.descending });
            } else {
              clickedCol.isSorted = false;
            }
          }}
          onRenderRow={onRenderRow}
        />
      </div>
    </div>
  );
};
