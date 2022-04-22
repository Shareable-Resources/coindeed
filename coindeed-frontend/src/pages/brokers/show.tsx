import React from 'react';
import { useParams } from 'react-router-dom';
import { Broker, BrokersView } from '../../components/brokers/BrokersView';
// import { deedManagers } from '../../components/managers/dasboard/ManagersDashboard';

type ManagerViewParam = {
  brokerId: string;
};

export const ViewBrokerPage = () => {
  const params = useParams<ManagerViewParam>();
  const brokerInfo: Broker = {
    address: params.brokerId,
    deeds: [],
  };

  // TODO: get rid of broker and use broker id from params to get broker info
  return <BrokersView broker={brokerInfo} />;
};
