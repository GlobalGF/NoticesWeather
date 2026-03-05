-- High-priority municipalities for prebuild selection
select slug, name, province, autonomous_community, priority_score
from municipalities
order by priority_score desc
limit 2000;