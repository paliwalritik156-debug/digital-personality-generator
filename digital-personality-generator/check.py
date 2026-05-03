with open('frontend/index.html') as f:
    c = f.read()
pr = c[c.find('<div id="pr"'):c.find('<!-- Email Modal')]
opens = pr.count('<div')
closes = pr.count('</div>')
print(f'opens={opens} closes={closes} diff={opens-closes}')
