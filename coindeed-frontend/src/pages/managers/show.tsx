import React from 'react';
import { useParams } from 'react-router-dom';
import { ManagersView } from '../../components/managers/edit/ManagersView';
// import { deedManagers } from '../../components/managers/dasboard/ManagersDashboard';

type ManagerViewParam = {
  managersId: string;
};

export const ViewManagerPage = () => {
  const params = useParams<ManagerViewParam>();
  const manager = {
    APY: 0.914,
    totalStaking: 100000000.0,
    openDeeds: 4,
    managerAddress: params.managersId,
    deeds: [],
    wholesales: [],
  };

  // TODO: get rid of manager and use manager id from params sto get Manager
  return <ManagersView manager={manager} />;
};
