// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  CheckboxVisibility,
  IDetailsColumnStyleProps,
  IDetailsColumnStyles,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import moment from 'moment';
import { useState } from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { IStyleFunctionOrObject } from 'office-ui-fabric-react/lib';

import { listRoot, tableView, detailList } from './styles';

export interface IStatusListProps {
  items: IStatus[];
  onLogClick: (item: IStatus) => void;
  onRollbackClick: (item: IStatus) => void;
  updateItems: (items: IStatus[]) => void;
}

export interface IStatus {
  id: string;
  time: string;
  status: number;
  message: string;
  comment: string;
  action?: {
    href: string;
    label: string;
  };
}

function onRenderDetailsHeader(props, defaultRender) {
  return (
    <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
      {defaultRender({
        ...props,
        onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
      })}
    </Sticky>
  );
}

export const PublishStatusList: React.FC<IStatusListProps> = (props) => {
  const { items, onLogClick, onRollbackClick } = props;
  const [currentSort, setSort] = useState({ key: 'PublishDate', descending: true });
  const sortByDate = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    if (column.isSorted) {
      column.isSortedDescending = !column.isSortedDescending;
      const newItems: IStatus[] = items.reverse();
      props.updateItems(newItems);
    }
  };
  const colomnStyle: IStyleFunctionOrObject<IDetailsColumnStyleProps, IDetailsColumnStyles> = {
    root: { display: 'flex', alignItems: 'center' },
  };
  const columns = [
    {
      key: 'PublishTime',
      name: formatMessage('Time'),
      className: 'publishtime',
      fieldName: 'time',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      styles: colomnStyle,
      onRender: (item: IStatus) => {
        return <span>{moment(item.time).format('h:mm a')}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishDate',
      name: formatMessage('Date'),
      className: 'publishdate',
      fieldName: 'date',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      styles: colomnStyle,
      onColumnClick: sortByDate,
      data: 'string',
      onRender: (item: IStatus) => {
        return <span>{moment(item.time).format('MM-DD-YYYY')}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishStatus',
      name: formatMessage('Status'),
      className: 'publishstatus',
      fieldName: 'status',
      minWidth: 40,
      maxWidth: 40,
      isResizable: true,
      data: 'string',
      styles: colomnStyle,
      onRender: (item: IStatus) => {
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
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      styles: colomnStyle,
      onRender: (item: IStatus) => {
        return (
          <span>
            {item.message}
            {item.action && (
              <Link
                aria-label={item.action.label}
                href={item.action.href}
                rel="noopener noreferrer"
                style={{ marginLeft: '3px' }}
                target="_blank"
              >
                {item.action.label}
              </Link>
            )}
          </span>
        );
      },
      isPadded: true,
    },
    {
      key: 'PublishComment',
      name: formatMessage('Comment'),
      className: 'comment',
      fieldName: 'comment',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      styles: colomnStyle,
      onRender: (item: IStatus) => {
        return <span>{item.comment}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishLog',
      name: '',
      className: 'publishLog',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: IStatus) => {
        return (
          <ActionButton
            allowDisabledFocus
            onClick={() => {
              onLogClick(item);
            }}
          >
            {formatMessage('View log')}
          </ActionButton>
        );
      },
      isPadded: true,
    },
    {
      key: 'PublishRollback',
      name: '',
      className: 'publishrollback',
      fieldName: 'publishRollback',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: IStatus) => {
        return (
          <ActionButton
            allowDisabledFocus
            onClick={() => {
              onRollbackClick(item);
            }}
          >
            {formatMessage('Rollback')}
          </ActionButton>
        );
      },
      isPadded: true,
    },
  ];

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
          getKey={(item) => item.id}
          groupProps={{
            showEmptyGroups: true,
          }}
          items={items}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.single}
          setKey="none"
          onColumnHeaderClick={(_, clickedCol) => {
            if (!clickedCol) return;
            if (clickedCol.key === currentSort.key) {
              clickedCol.isSortedDescending = !currentSort.descending;
              setSort({ key: clickedCol.key, descending: !currentSort.descending });
            } else {
              clickedCol.isSorted = false;
            }
          }}
          onRenderDetailsHeader={onRenderDetailsHeader}
        />
      </div>
    </div>
  );
};