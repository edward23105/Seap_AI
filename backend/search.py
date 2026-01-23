from typing import Optional
from elasticsearch import Elasticsearch
from datamodels import DataSend, DataFormat



es = Elasticsearch("http://localhost:9200")   # adapt if needed

# TODO trebuie sa caute si prin loturi
def get_data(
    index_subclass: str = "",
    size: int = 10,
    sort_by: Optional[str] = None,
    order: str = "asc",
    cpv: Optional[str] = None,
    minvalue: Optional[float] = None,
    maxvalue: Optional[float] = None,
    keywords: Optional[str] = None,
    date: Optional[str] = None
):
    index_name = "licitatii" + index_subclass

    must = []
    filters = []

    # CPV filter (adjust field name if your mapping differs)
    if cpv:
        must.append({
            "match": {
                "noticeContracts.items.cpvCode": cpv
            }
        })

    # numeric range filter – use the FLOAT field (this is the one from your error)
    if minvalue is not None or maxvalue is not None:
        range_body = {}
        if minvalue is not None:
            range_body["gte"] = minvalue
        if maxvalue is not None:
            range_body["lte"] = maxvalue

        filters.append({
            "range": {
                "publicNotice.caNoticeEdit_New.section2_New.section2_2_New.descriptionList.estimatedValue": range_body
            }
        })

    # date filter (simple match – you can change to range if needed)
    if date:
        must.append({
            "match": {
                "noticePublication.publicationDate": date
            }
        })

    # keyword search across multiple text fields
    if keywords:
        must.append({
            "multi_match": {
                "query": keywords,
                "fields": [
                    "publicNotice.caNoticeTitle",
                    "publicNotice.caNoticeEdit_New.section2_New.section2_2_New.descriptionList.description",
                    "contractingAuthority.name",
                    "noticeContracts.items.description"
                ],
                "type": "best_fields"
            }
        })

    query_body = {
        "query": {
            "bool": {
                "must": must if must else [{"match_all": {}}],
                "filter": filters
            }
        }
    }

    # Sorting – you usually sort by date or value, not keywords
    if sort_by:
        query_body["sort"] = [
            {
                sort_by: {
                    "order": order
                }
            }
        ]

    resp = es.search(
        index=index_name,
        body=query_body,
        size=size
    )

    # if you already have transform_data() keep using it
    return transform_data(resp)


def extract_description(public_notice):
    # 1. Descriere per total (shortDescription)
    desc_total = (
        public_notice.get('caNoticeEdit_New_U', {})
            .get('section2_New_U', {})
            .get('section2_1_New_U', {})
            .get('shortDescription')
        or
        public_notice.get('caNoticeEdit_New', {})
            .get('section2_New', {})
            .get('section2_1_New', {})
            .get('shortDescription')
    )
    if desc_total:
        return desc_total

    # 2. descriptionList (pertotal)
    desc_list_u = (
        public_notice.get('caNoticeEdit_New_U', {})
            .get('section2_New_U', {})
            .get('section2_2_New_U', {})
            .get('descriptionList', [])
    )
    desc_list_nu = (
        public_notice.get('caNoticeEdit_New', {})
            .get('section2_New', {})
            .get('section2_2_New', {})
            .get('descriptionList', [])
    )

    if desc_list_u:
        return desc_list_u[0].get('shortDescription') or desc_list_u[0].get('description')

    if desc_list_nu:
        return desc_list_nu[0].get('shortDescription') or desc_list_nu[0].get('description')

    # 3. Loturi (fallback)
    lots_u = public_notice.get('caNoticeEdit_New_U', {}).get('section5_New_U', {}).get('lots', [])
    lots_nu = public_notice.get('caNoticeEdit_New', {}).get('section5_New', {}).get('lots', [])
    all_lots = lots_u or lots_nu

    if all_lots:
        lot_desc = all_lots[0].get('shortDescription') or all_lots[0].get('description')
        if lot_desc:
            return lot_desc

    return "Descriere indisponibilă"
def transform_data(es_data: dict) -> DataSend:

    deals = []
    hits = es_data.get('hits', {}).get('hits', [])

    for hit in hits:
        source = hit.get('_source', {})
        public_notice = source.get('publicNotice', {})

        # ---------------------------
        # TITLU
        # ---------------------------
        title = (
            public_notice.get('title')
            or public_notice.get('caNoticeEdit_New_U', {})
                .get('section2_New_U', {})
                .get('section2_1_New_U', {})
                .get('contractTitle')
            or public_notice.get('caNoticeEdit_New', {})
                .get('section2_New', {})
                .get('section2_1_New', {})
                .get('contractTitle')
            or "Titlu indisponibil"
        )

        # ---------------------------
        # DESCRIERE (funcție separată)
        # ---------------------------
        description = extract_description(public_notice)

        # ---------------------------
        # AUTORITATE
        # ---------------------------
        authority = (
            public_notice.get('caNoticeEdit_New_U', {})
                .get('section1_New_U', {})
                .get('section1_1', {})
                .get('caAddress', {})
                .get('officialName')
            or public_notice.get('caNoticeEdit_New', {})
                .get('section1_New', {})
                .get('section1_1', {})
                .get('caAddress', {})
                .get('officialName')
            or source.get('item', {}).get('contractingAuthorityNameAndFN')
            or "Autoritate necunoscută"
        )

        # ---------------------------
        # VALOARE CONTRACT
        # ---------------------------
        value = (
            public_notice.get('caNoticeEdit_New_U', {})
                .get('section2_New_U', {})
                .get('section2_1_New_U', {})
                .get('totalAcquisitionValue')
            or public_notice.get('caNoticeEdit_New', {})
                .get('section2_New', {})
                .get('section2_1_New', {})
                .get('totalAcquisitionValue')
            or source.get('item', {}).get('ronContractValue')
            or None
        )

        # ---------------------------
        # CPV
        # ---------------------------
        cpv = (
            public_notice.get('caNoticeEdit_New_U', {})
                .get('section2_New_U', {})
                .get('section2_1_New_U', {})
                .get('mainCPVCode', {})
                .get('text')
            or public_notice.get('caNoticeEdit_New', {})
                .get('section2_New', {})
                .get('section2_1_New', {})
                .get('mainCPVCode', {})
                .get('text')
            or source.get('item', {}).get('cpvCodeAndName')
            or None
        )

        # ---------------------------
        # LOTURI — LISTĂ COMPLETĂ
        # ---------------------------
        lots_u = public_notice.get('caNoticeEdit_New_U', {}).get('section5_New_U', {}).get('lots', [])
        lots_nu = public_notice.get('caNoticeEdit_New', {}).get('section5_New', {}).get('lots', [])
        all_lots = lots_u or lots_nu or []

        # transformăm fiecare lot în dict / DataClass
        lots_output = []
        for lot in all_lots:
            lots_output.append({
                "description": lot.get("shortDescription") or lot.get("description") or "Fără descriere",
                "value": lot.get("acquisitionValue") or lot.get("lotValue") or None
            })

        # ---------------------------
        # SAVINGS
        # ---------------------------
        savings = value * 0.1 if value else None

        # ---------------------------
        # CREARE OBIECT DEAL
        # ---------------------------
        deal = DataFormat(
            title=title,
            description=description,
            savings=savings,
            authority=authority,
            value=value,
            cpv=cpv,
            lots=lots_output  # <-- noul câmp
        )

        deals.append(deal)

    return DataSend(deals=deals)




