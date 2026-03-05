-- Cross join constrained top combos for /baterias-solares/[tarifa]/[consumo]
select t.slug as tarifa, b.slug as consumo
from tariffs t
cross join consumption_bands b
order by t.slug, b.min_kwh
limit 200;