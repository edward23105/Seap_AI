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


    query_body = {
        "query": {
            "bool": {
                "must": must if must else [{"match_all": {}}],
                "filter": filters
            }
        }
    }

    resp = es.search(
        index=index_name,
        body=query_body,
        size=size
    )

    return transform_data(resp)

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
            or "Titlu indisponibil"
        )

        # ---------------------------
        # DESCRIERE (funcție separată)
        # ---------------------------
        description = (
            public_notice.get('description')
        or "Descriere indisponibila"
        )

        # ---------------------------
        # AUTORITATE
        # ---------------------------
        authority = (
            public_notice.get('authority')
            or "Autoritate necunoscută"
        )

        # ---------------------------
        # VALOARE CONTRACT
        # ---------------------------
        value = (
            public_notice.get('totalValue')
            or None
        )

        # ---------------------------
        # CPV
        # ---------------------------
        cpv = (
            public_notice.get('cpv') 
            or None
        )

        # ---------------------------
        # LOTURI — LISTĂ COMPLETĂ
        # ---------------------------
        all_lots = public_notice.get('lots')

        # transformăm fiecare lot în dict / DataClass
        lots_output = []
        for lot in all_lots:
            lots_output.append({
                "description": lot.get("description") or "Fără descriere",
                "value": lot.get("estimatedValue") or None
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




