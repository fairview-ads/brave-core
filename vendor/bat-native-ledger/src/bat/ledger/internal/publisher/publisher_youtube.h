/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVELEDGER_PUBLISHER_YOUTUBE_H_
#define BRAVELEDGER_PUBLISHER_YOUTUBE_H_

#include <memory>
#include <string>

#include "bat/ledger/ledger.h"

namespace bat_ledger {
class LedgerImpl;
}

namespace braveledger_publisher {

class YouTube {
 public:
  explicit YouTube(bat_ledger::LedgerImpl* ledger);

  ~YouTube();

  void UpdateMediaDuration(
      const uint64_t window_id,
      const std::string& media_type,
      const std::string& url,
      const std::string& publisher_key,
      const std::string& publisher_name,
      const std::string& media_id,
      const std::string& media_key,
      const std::string& favicon_url,
      uint64_t duration);

  void GetPublisherPanelInfo(
      const uint64_t window_id,
      const std::string& media_type,
      const std::string& url,
      const std::string& channel_id,
      const std::string& publisher_key,
      const std::string& publisher_name,
      const std::string& favicon_url);

  void SavePublisherVisitChannel(
      const uint64_t window_id,
      const std::string& media_type,
      const std::string& url,
      const std::string& channel_id,
      const std::string& publisher_key,
      const std::string& publisher_name,
      const std::string& favicon_url);

  void SavePublisherVisitUser(
      const uint64_t window_id,
      const std::string& media_type,
      const std::string& url,
      const std::string& channel_id,
      const std::string& publisher_key,
      const std::string& publisher_name,
      const std::string& media_key);

  void SavePublisherVisitVideo(
      const uint64_t window_id,
      const std::string& media_type,
      const std::string& url,
      const std::string& channel_id,
      const std::string& publisher_key,
      const std::string& publisher_name,
      const std::string& media_key,
      const std::string& favicon_url);

  void SavePublisherVisitCustom(
      const uint64_t window_id,
      const std::string& media_type,
      const std::string& url,
      const std::string& channel_id,
      const std::string& publisher_key,
      const std::string& publisher_name,
      const std::string& favicon_url);

 private:
  void GetPublisherPanelInfo(
      const uint64_t window_id,
      const std::string& media_type,
      const ledger::VisitData& visit_data,
      const std::string& channel_id,
      const std::string& publisher_key,
      const std::string& publisher_name,
      const std::string& favicon_url);

  void SavePublisherInfo(
      const uint64_t window_id,
      const std::string& media_type,
      const uint64_t duration,
      const std::string& media_key,
      const std::string& publisher_key,
      const std::string& publisher_url,
      const std::string& publisher_name,
      const ledger::VisitData& visit_data,
      const std::string& favicon_url,
      const std::string& channel_id);

  void HandleUserPathVisit(
      ledger::PublisherInfoPtr info,
      const uint64_t window_id,
      const std::string& media_type,
      const std::string& url,
      const std::string& channel_id,
      const std::string& publisher_key,
      const std::string& publisher_name,
      const std::string& media_key);

  void OnPanelPublisherInfo(
      uint64_t window_id,
      const std::string& media_type,
      const ledger::VisitData& visit_data,
      const std::string& channel_id,
      const std::string& publisher_key,
      const std::string& publisher_name,
      const ledger::Result result,
      ledger::PublisherInfoPtr info);

  void OnMediaActivityError(const uint64_t window_id, const std::string& url);

  bat_ledger::LedgerImpl* ledger_;  // NOT OWNED
};

}  // namespace braveledger_publisher

#endif  // BRAVELEDGER_PUBLISHER_YOUTUBE_H_
